import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import { useDeepCompareMemo } from 'use-deep-compare';
import { useManageSession } from './hooks';
import { showNotification } from '@mantine/notifications';
import type { AuthTokenData, Session, SessionProviderProps } from './types';
import { isUserOnPage } from './utils';
import {
  type CoreState,
  GEN3_REDIRECT_URL,
  Modals,
  selectUserAuthStatus,
  showModal,
  useCoreDispatch,
  useCoreSelector,
  useGetCSRFQuery,
  useLazyFetchUserDetailsQuery,
} from '@gen3/core';
import { ACTIVITY_CHANNEL } from './constants';
import { Center, Loader } from '@mantine/core';
import { useThrottledCallback } from '@mantine/hooks';

import { minutesToMilliseconds } from '../../utils';
import { useWorkspaceResourceMonitor } from '../../components/Providers/ResourceMonitor';
import { modals } from '@mantine/modals';

const ACTIVITY_THROTTLE_TIMEOUT = 7000;

// Verbose session/refresh/inactivity console logging, off by default. Every
// call site below is guarded by this flag with an `if` rather than a wrapper
// function, so when it is disabled the log payload — object literals, date
// formatting — is never constructed, not just never printed.
const SESSION_DEBUG_LOGGING = process.env.NEXT_PUBLIC_SESSION_DEBUG === 'true';

// Coming back to the page re-derives the refresh schedule from the real token.
// Several signals mean "we are back" and can arrive together, so they share one
// throttle: this keeps tab- and window-flipping from turning into one request per
// flip.
const CATCH_UP_THROTTLE_MILLISECONDS = 10000;

/**
 * Events that count as user activity.
 *
 * `keydown` rather than `keypress`: the latter is deprecated and never fires for
 * arrows, backspace, delete or tab, so editing with those looked like inactivity.
 * `scroll` does not bubble, so it is registered in the capture phase to also see
 * scrolling inside nested containers; it and `touchstart` are passive so activity
 * tracking cannot delay scrolling.
 */
const ACTIVITY_EVENTS: ReadonlyArray<
  readonly [type: string, options?: AddEventListenerOptions]
> = [
  ['mousedown'],
  ['keydown'],
  ['updateUserActivity'],
  ['scroll', { passive: true, capture: true }],
  ['touchstart', { passive: true }],
];

export const logoutSession = async (basePath: string) => {
  const response = await fetch(`${basePath}/api/auth/sessionLogout`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`logout request failed (${response.status})`);
  }
};

export const SessionContext = React.createContext<Session | undefined>(
  undefined,
);

/**
 *  We eventually want to use the session token to determine if the user is logged in
 *  as opposed to the user status since that check will happen on the server using httpOnly cookies
 *  and verification of the session token
 *
 * @param basePath - Next.js `router.basePath`: '' when the app is served from the
 *   root and already leading-slashed otherwise. Required for the API route to
 *   resolve under a basePath deployment.
 */
export const getSession = async (
  basePath: string = '',
): Promise<AuthTokenData> => {
  try {
    const res = await fetch(`${basePath}/api/auth/sessionToken`, {
      cache: 'no-store',
    });
    if (res.status === 200) {
      return (await res.json()) as AuthTokenData;
    }
    // A non-200 means we could not determine the token state — report that as
    // 'error' rather than as a missing token so callers can retry instead of
    // treating it as a definitive answer.
    return { status: 'error' };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error: unknown) {
    return { status: 'error' };
  }
};

export const useSession = (
  required = false,
  onUnauthenticated?: () => void,
) => {
  const router = useRouter();
  const session = useContext(SessionContext);

  // Kept in a ref so the redirect effect below does not re-run every render
  // when the caller passes an inline function.
  const onUnauthenticatedRef = useRef(onUnauthenticated);
  useEffect(() => {
    onUnauthenticatedRef.current = onUnauthenticated;
  }, [onUnauthenticated]);

  const isUnauthenticated =
    required &&
    session !== undefined &&
    !session.pending &&
    session.status !== 'issued';

  // Fires once per unauthenticated transition. `router` has to be a dependency,
  // and the pages router hands back a new object on every route change, so
  // without the ref a navigation would re-run this and stack a second redirect
  // (or a second `onUnauthenticated`, which for a delayed handler means a second
  // timer).
  const redirectHandledRef = useRef(false);

  // Navigating is a side effect: doing it in the render body warns in React,
  // runs twice under StrictMode, and can loop when the target route also
  // renders a `required` consumer. Effects don't run on the server, so this
  // also replaces the previous explicit SSR guard.
  useEffect(() => {
    if (!isUnauthenticated) {
      redirectHandledRef.current = false;
      return;
    }
    if (redirectHandledRef.current) return;
    redirectHandledRef.current = true;

    if (onUnauthenticatedRef.current) {
      onUnauthenticatedRef.current();
      return;
    }
    void router.push('/Login');
  }, [isUnauthenticated, router]);

  if (!session) {
    throw new Error(
      '[gen3]: `useSession` must be wrapped in a <SessionProvider />',
    );
  }

  return session;
};

export const useIsAuthenticated = () => {
  const session = useSession();
  return {
    isAuthenticated: session.status === 'issued',
    user: session.userContext,
  };
};

type IntervalFunction = () => void;

const useInterval = (callback: IntervalFunction, delay: number | null) => {
  const savedCallback = useRef<IntervalFunction | null>(null);

  useEffect(() => {
    if (delay === null) return;
    savedCallback.current = callback;
  });

  useEffect(() => {
    if (delay === null) return;
    function tick() {
      if (savedCallback.current !== null) {
        savedCallback.current();
      }
    }
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
};

// Refreshing against the token's own `exp` means we hit Fence's /user endpoint at most
// once per token lifetime instead of on a fixed clock that can drift into
// (or past) the actual expiry.
//
// This targets `exp` itself, not a margin before it: Fence (with
// RENEW_ACCESS_TOKEN_BEFORE_EXPIRATION unset/false, which we do not control)
// only reissues the access_token cookie reactively, once it has actually
// expired — a proactive call ahead of that reissues nothing and just gets read
// again unchanged. This buffer only absorbs latency/clock difference between
// the Next.js server and Fence, not the browser's clock — see `expiresInMs`.
const REFRESH_BUFFER_MILLISECONDS = 2000;
// How soon we retry once, and only once, after a cycle that didn't produce a
// healthy token: hitting /user reissues the cookie, so one prompt attempt often
// fixes things. Repeating it at this rate would not, hence the backoff below.
const MIN_REFRESH_DELAY_MILLISECONDS = 5000;
// Backoff for every subsequent unhealthy cycle. Without it, a cause that a
// refresh cannot fix — an unreachable endpoint, a skewed browser clock, a token
// Fence will not renew — turns into a tight poll against /user.
const REFRESH_RETRY_BASE_MILLISECONDS = 30000;
const REFRESH_RETRY_MAX_MILLISECONDS = minutesToMilliseconds(5);

/**
 * How often the heartbeat re-checks the refresh deadline against the wall clock.
 *
 * The scheduled `setTimeout` is still the primary mechanism — it is precise and
 * costs nothing until it fires. This supervises it: a deadline can be missed
 * because the timer was never armed (a branch that returned early, a race between
 * a cycle and a re-derivation) or because the tab was suspended long enough for
 * the browser to deliver it late. Each tick is cheap — it compares two numbers
 * and does nothing unless a deadline is actually overdue — so a frequency this
 * high costs nothing in the common case.
 *
 * It does not, and cannot, refresh while the page is frozen: no timer in the
 * document runs then. What it bounds is how long an overdue refresh stays
 * overdue once the page is running again.
 */
const REFRESH_HEARTBEAT_INTERVAL_MILLISECONDS = 30000;

/**
 * How far past the deadline the heartbeat waits before stepping in, so a timer
 * that is about to fire on its own is left to do it. One interval: if the timeout
 * is going to fire, it has already had a full tick's worth of slack.
 */
const REFRESH_HEARTBEAT_GRACE_MILLISECONDS =
  REFRESH_HEARTBEAT_INTERVAL_MILLISECONDS;

const MILLISECONDS_PER_MINUTE = minutesToMilliseconds(1);

/**
 * Delay before the next refresh of a healthy token, or a negative/small number
 * when the token does not look healthy (see `unhealthyRefreshDelay`).
 *
 * `session.expiresInMs` is computed by the Next.js server (`exp * 1000 -
 * Date.now()` against *its own* clock) and shipped as a ready-to-use relative
 * delay, so the browser never has to diff a server-issued epoch against its
 * own clock — a skewed browser clock cannot make this wrong. Older responses
 * without the field (or a stale cached one) fall back to computing it here,
 * which is exposed to that skew again.
 *
 * The remaining delay can never exceed the token's full lifetime, so `iat`
 * gives us a skew-free upper bound in case `expiresInMs` is ever missing or
 * wrong.
 */
const refreshDelayFromToken = (session: AuthTokenData): number => {
  const serverRelativeDelay =
    session.expiresInMs !== undefined
      ? session.expiresInMs
      : (session.expires ?? 0) * 1000 - Date.now();

  const delay = serverRelativeDelay + REFRESH_BUFFER_MILLISECONDS;

  if (!session.issued || !session.expires) return delay;

  const lifetime = (session.expires - session.issued) * 1000;
  return Math.min(delay, lifetime + REFRESH_BUFFER_MILLISECONDS);
};

/**
 * Delay after `failures` consecutive cycles that did not yield a healthy,
 * future-dated token: prompt for the first, backing off for the rest.
 */
const unhealthyRefreshDelay = (failures: number) =>
  failures <= 0
    ? MIN_REFRESH_DELAY_MILLISECONDS
    : Math.min(
        REFRESH_RETRY_MAX_MILLISECONDS,
        REFRESH_RETRY_BASE_MILLISECONDS * 2 ** (failures - 1),
      );

/**
 * SessionProvider creates a React context which keeps track of whether the user is
 * authenticated, refreshes their access token ahead of its expiry, and logs them
 * out if they do not act within an allotted amount of time.
 *
 * See {@link SessionConfiguration} for what each option means; all times are in
 * minutes.
 *
 * @param children - Subtree that gets access to the session context
 * @param updateSessionTime - How often the inactivity check runs, and so the
 *   resolution of every inactivity decision. `0` disables activity monitoring
 * @param inactiveTimeLimit - Inactivity allowed before logout, except for Workspace pages
 * @param workspaceInactivityTimeLimit - Inactivity allowed before logout on a
 *   workspace page. `0` (the default) means no limit there
 * @param logoutInactiveUsers - Whether inactive users are logged out at all
 * @param monitorWorkspace - Whether to poll running/configured workspaces
 * @param expireWarningMinutes - How far ahead of the inactivity logout to warn;
 *   clamped to fit the poll interval and the inactivity window
 * @returns a Session context that can be used to keep track of user session activity
 */
export const SessionProvider = ({
  children,
  updateSessionTime = 5,
  inactiveTimeLimit = 20,
  workspaceInactivityTimeLimit = 0,
  logoutInactiveUsers = true,
  monitorWorkspace = true,
  expireWarningMinutes = 5,
}: SessionProviderProps) => {
  const router = useRouter();
  const coreDispatch = useCoreDispatch();

  const {
    isSuccess: isGetCSRFSuccess,
    isError: isGetCSRFError,
    isFetching: isFetchingCSRF,
  } = useGetCSRFQuery();
  useWorkspaceResourceMonitor(monitorWorkspace); // monitor workspaces if any are running or configured

  const [getUserDetails] = useLazyFetchUserDetailsQuery(); // Fetch user details
  const userStatus = useCoreSelector((state: CoreState) =>
    selectUserAuthStatus(state),
  );

  const [mostRecentActivityTimestamp, setMostRecentActivityTimestamp] =
    // oxlint-disable-next-line react/react-compiler
    useState(Date.now());

  // Token metadata (issued / expires / userContext) read from
  // /api/auth/sessionToken. Surfaced on the context so consumers of `Session`
  // actually receive the fields the type promises.
  const [authTokenData, setAuthTokenData] = useState<
    AuthTokenData | undefined
  >();

  // Guards async continuations and timers that can outlive the provider.
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Initialize BroadcastChannel for cross-tab communication
  // any user event on one tab or window will update mostRecentActivityTimestamp
  useEffect(() => {
    // Cross-tab activity sync is an enhancement, not a requirement: it is
    // unavailable on Safari < 15.4 and in non-DOM environments, and the session
    // has to keep working without it.
    if (
      typeof window === 'undefined' ||
      typeof BroadcastChannel === 'undefined'
    )
      return;

    let channel: BroadcastChannel;
    try {
      channel = new BroadcastChannel(ACTIVITY_CHANNEL);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error: unknown) {
      return;
    }
    broadcastChannelRef.current = channel;

    // Listen for activity updates from other tabs. Anything on the origin can
    // post here, so treat the payload as untrusted: a malformed message must not
    // throw, and a future-dated timestamp must not be able to hold the
    // inactivity clock open forever.
    const handleActivityMessage = (event: MessageEvent) => {
      const data = event.data as
        { type?: unknown; timestamp?: unknown } | null | undefined;
      if (data?.type !== 'activity-update') return;
      if (typeof data.timestamp !== 'number' || Number.isNaN(data.timestamp))
        return;
      setMostRecentActivityTimestamp(Math.min(data.timestamp, Date.now()));
    };

    channel.addEventListener('message', handleActivityMessage);

    return () => {
      channel.removeEventListener('message', handleActivityMessage);
      channel.close();
      broadcastChannelRef.current = null;
    };
  }, []);

  const expireWarningMilliseconds = minutesToMilliseconds(expireWarningMinutes);

  const inactiveTimeLimitMilliseconds =
    minutesToMilliseconds(inactiveTimeLimit);

  const workspaceInactivityTimeLimitMilliseconds = minutesToMilliseconds(
    workspaceInactivityTimeLimit,
  );
  const updateSessionIntervalMilliseconds =
    minutesToMilliseconds(updateSessionTime);

  // update session status using the user status

  const sessionInfo = useManageSession(userStatus);

  // Timers read the login state through a ref so a refresh scheduled while the
  // user was logged in cannot keep firing after they log out.
  const sessionStatusRef = useRef(sessionInfo.status);
  useEffect(() => {
    sessionStatusRef.current = sessionInfo.status;
  }, [sessionInfo.status]);

  // for now, we are using the user status to determine if the user is logged in
  const updateSession = useCallback(() => {
    // The query holds its own error state; catch so a failure here cannot surface
    // as an unhandled rejection.
    void Promise.resolve(getUserDetails()).catch(() => undefined);
  }, [getUserDetails]);

  // `userStatus` is derived from the /user cache entry, which nothing in a hidden
  // tab invalidates, so a token that expires while the tab is backgrounded leaves
  // the store reporting `authenticated` indefinitely: the UI stays logged in,
  // every request 401s, and no logout or re-login is ever prompted. This request
  // resolves that — Fence either reissues the cookie off its own session, or
  // answers unauthenticated and the store settles, which drops
  // `sessionInfo.status` off 'issued' and tears the schedule down.
  const resettleLoginState = useCallback(() => {
    // Same shape as `updateSession`: the query owns its error state, so swallow
    // the rejection rather than let it surface unhandled.
    void Promise.resolve(getUserDetails()).catch(() => undefined);
  }, [getUserDetails]);

  // Read the token metadata and mirror it into state for the context value.
  // `basePath` is fixed for the lifetime of the app, so depending on it does not
  // churn this callback (or the refresh schedule derived from it).
  const syncAuthTokenData = useCallback(async (): Promise<AuthTokenData> => {
    const session = await getSession(router.basePath);
    // Don't clobber known-good data with a failed lookup.
    if (session.status !== 'error' && isMountedRef.current) {
      setAuthTokenData(session);
    }
    return session;
  }, [router.basePath]);

  // Proactive, expiry-driven token refresh.
  //
  // Fence reissues the access_token cookie every time /user is hit, so we
  // schedule exactly one refresh per token lifetime — timed from the token's
  // own `exp` claim (via /api/auth/sessionToken) rather than a fixed clock
  // that can drift into, or past, the real expiry.
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Consecutive cycles that did not yield a healthy token. In a ref so it
  // survives re-derivations of the schedule: a tab foreground must not reset the
  // backoff, or flipping tabs while the endpoint is down restarts fast retries.
  const refreshFailuresRef = useRef(0);

  // Whether the one recovery attempt for a definitively dead token has been
  // spent. Deliberately *not* the backoff counter above: a tab that sat hidden
  // long enough for the token to expire has usually burned that counter on
  // late-firing timers, and sharing it meant the expired branch below found it
  // non-zero and armed nothing at all — the user came back to a dead session
  // that never tried to recover. Reset when the tab is foregrounded and on a
  // fresh login, so returning to a stale tab always gets an attempt.
  const expiredRecoveryAttemptedRef = useRef(false);

  // Set while a refresh cycle is running, so a concurrent re-derivation defers to
  // it instead of racing to arm the timer off a staler read.
  const refreshInFlightRef = useRef(false);

  // When the armed refresh is due, as an absolute timestamp, or null when nothing
  // is owed. The `setTimeout` above carries the same information as a duration,
  // but a duration cannot be re-checked: it is only ever right if the callback
  // runs when it was promised. This is what the heartbeat compares against.
  const refreshDueAtRef = useRef<number | null>(null);

  // Debug-only: when the last refresh cycle actually completed. Not used by
  // any scheduling logic — purely for the console logging below.
  const lastRefreshedAtRef = useRef<number | null>(null);

  const clearScheduledRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      if (SESSION_DEBUG_LOGGING) {
        // eslint-disable-next-line no-console
        console.log('[session-refresh] clearing scheduled refresh timer');
      }
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    refreshDueAtRef.current = null;
  }, []);

  // A refresh cycle re-arms the timer that started it. The cycle is held in a ref
  // so `armRefreshTimer` does not have to depend on it — every timer can only fire
  // after the commit that assigns this, so it is always populated when read.
  const performScheduledRefreshRef = useRef<(() => Promise<void>) | null>(null);

  const armRefreshTimer = useCallback(
    (delay: number) => {
      clearScheduledRefresh();
      if (!isMountedRef.current) return;
      const dueAt = Date.now() + delay;
      refreshDueAtRef.current = dueAt;
      if (SESSION_DEBUG_LOGGING) {
        // eslint-disable-next-line no-console
        console.log(
          `[session-refresh] armed: next refresh in ${(delay / 1000).toFixed(1)}s, due at ${new Date(dueAt).toISOString()}`,
        );
      }
      refreshTimeoutRef.current = setTimeout(() => {
        void performScheduledRefreshRef.current?.();
      }, delay);
    },
    [clearScheduledRefresh],
  );

  // Decide the next timer from a token read.
  //
  // `loginStateIsFresh` says whether the caller has just been to /user, so the
  // dead-token branches below can skip re-settling a login state that is already
  // current instead of spending a second request on it.
  const scheduleFromTokenData = useCallback(
    (session: AuthTokenData, loginStateIsFresh = false) => {
      if (SESSION_DEBUG_LOGGING) {
        // eslint-disable-next-line no-console
        console.log('[session-refresh] scheduleFromTokenData', {
          status: session.status,
          issued: session.issued
            ? new Date(session.issued * 1000).toISOString()
            : undefined,
          expires: session.expires
            ? new Date(session.expires * 1000).toISOString()
            : undefined,
          remainingSeconds: session.expires
            ? Math.round(session.expires - Date.now() / 1000)
            : undefined,
          loginStateIsFresh,
          failures: refreshFailuresRef.current,
        });
      }

      if (!isMountedRef.current) return;
      if (sessionStatusRef.current !== 'issued') return;

      // No cookie at all: there is nothing to renew. The login state does not
      // settle to unauthenticated on its own — it is derived from a cached /user
      // response — so ask for it rather than leaving the app acting logged in
      // against a token that is not there.
      if (session.status === 'not present') {
        if (!loginStateIsFresh) resettleLoginState();
        return;
      }

      // `exp` at or before `iat` is a malformed token; no retry fixes that.
      if (
        session.issued &&
        session.expires &&
        session.expires <= session.issued
      )
        return;

      if (session.status === 'expired' || session.status === 'invalid') {
        // A definitive answer, but a single /user call can still re-authenticate
        // through Fence's own session and reissue the cookie — and that same call
        // is what tells the store the session is gone when it cannot. Either way
        // the app stops believing a dead token is live.
        if (!loginStateIsFresh) resettleLoginState();

        // Backstop for when that request does not move the login state at all
        // (an unreachable endpoint leaves it authenticated): retry the full cycle
        // once. Anything beyond that is polling a token that is not coming back.
        if (!expiredRecoveryAttemptedRef.current) {
          expiredRecoveryAttemptedRef.current = true;
          armRefreshTimer(MIN_REFRESH_DELAY_MILLISECONDS);
        }
        return;
      }

      if (session.expires) {
        const delay = refreshDelayFromToken(session);
        if (delay >= MIN_REFRESH_DELAY_MILLISECONDS) {
          refreshFailuresRef.current = 0;
          expiredRecoveryAttemptedRef.current = false;
          armRefreshTimer(delay);
          return;
        }
      }

      // Either the read failed ('error') or the token reads as already expiring.
      // Refreshing may fix that; if it doesn't, doing it again at the same rate
      // won't either, so each attempt costs more than the last.
      armRefreshTimer(unhealthyRefreshDelay(refreshFailuresRef.current));
      refreshFailuresRef.current += 1;
    },
    [armRefreshTimer, resettleLoginState],
  );

  const performScheduledRefresh = useCallback(async () => {
    if (SESSION_DEBUG_LOGGING) {
      // eslint-disable-next-line no-console
      console.log('[session-refresh] performScheduledRefresh: firing', {
        sessionStatus: sessionStatusRef.current,
        lastRefreshedAt: lastRefreshedAtRef.current
          ? new Date(lastRefreshedAtRef.current).toISOString()
          : null,
        msSinceLastRefresh: lastRefreshedAtRef.current
          ? Date.now() - lastRefreshedAtRef.current
          : null,
      });
    }

    if (sessionStatusRef.current !== 'issued') {
      if (SESSION_DEBUG_LOGGING) {
        // eslint-disable-next-line no-console
        console.log(
          '[session-refresh] performScheduledRefresh: skipped, session not issued',
        );
      }
      return;
    }

    // This cycle consumes the deadline. `scheduleFromTokenData` sets the next one,
    // or deliberately leaves it unset for a token that is not coming back — which
    // is also what stops the heartbeat below from retrying such a token forever.
    refreshDueAtRef.current = null;

    // The flag covers scheduling as well as the read, so a re-derivation cannot
    // land between the two and arm a timer this cycle is about to replace.
    refreshInFlightRef.current = true;
    try {
      let session: AuthTokenData = { status: 'error' };
      try {
        await getUserDetails();
        session = await syncAuthTokenData();
        lastRefreshedAtRef.current = Date.now();
        if (SESSION_DEBUG_LOGGING) {
          // eslint-disable-next-line no-console
          console.log(
            '[session-refresh] performScheduledRefresh: /user call completed',
            { status: session.status },
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error: unknown) {
        // Leave `session` as 'error' so we retry rather than abandon the chain.
        if (SESSION_DEBUG_LOGGING) {
          // eslint-disable-next-line no-console
          console.log(
            '[session-refresh] performScheduledRefresh: /user call failed',
            error,
          );
        }
      }
      // This cycle opened with a /user call, so the login state is already as
      // current as a request can make it.
      scheduleFromTokenData(session, true);
    } finally {
      refreshInFlightRef.current = false;
    }
    // oxlint-disable-next-line react/react-compiler
  }, [getUserDetails, syncAuthTokenData, scheduleFromTokenData]);

  useEffect(() => {
    performScheduledRefreshRef.current = performScheduledRefresh;
  }, [performScheduledRefresh]);

  // Re-derive the schedule from a freshly read token.
  const rescheduleFromToken = useCallback(async () => {
    if (refreshInFlightRef.current) return; // that cycle schedules from its own read
    refreshInFlightRef.current = true;
    try {
      scheduleFromTokenData(await syncAuthTokenData());
    } finally {
      refreshInFlightRef.current = false;
    }
    // oxlint-disable-next-line react/react-compiler
  }, [scheduleFromTokenData, syncAuthTokenData]);

  // Supervise the armed timer against the wall clock.
  //
  // A deadline held only as a `setTimeout` duration is right exactly once — if the
  // callback runs when it was promised. It may not: a suspended tab gets its
  // timers delivered late, and an early return elsewhere can leave no timer armed
  // at all. Re-reading the deadline on a short interval makes a missed refresh
  // self-correcting instead of permanent, and puts a bound on how late it can be
  // that does not depend on how long the tab was away.
  const heartbeatTick = useCallback(() => {
    const dueAt = refreshDueAtRef.current;
    const now = Date.now();
    if (SESSION_DEBUG_LOGGING) {
      // eslint-disable-next-line no-console
      console.log('[session-refresh] heartbeat', {
        currentTime: new Date(now).toISOString(),
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        remainingSeconds: dueAt ? Math.round((dueAt - now) / 1000) : null,
        refreshInFlight: refreshInFlightRef.current,
        lastRefreshedAt: lastRefreshedAtRef.current
          ? new Date(lastRefreshedAtRef.current).toISOString()
          : null,
      });
    }

    if (dueAt === null) return; // nothing owed, or deliberately not rescheduled
    if (refreshInFlightRef.current) return; // that cycle owns the next deadline
    if (now < dueAt + REFRESH_HEARTBEAT_GRACE_MILLISECONDS) return;

    if (SESSION_DEBUG_LOGGING) {
      // eslint-disable-next-line no-console
      console.log(
        '[session-refresh] heartbeat: deadline overdue, forcing refresh',
      );
    }
    void performScheduledRefreshRef.current?.();
  }, []);

  useInterval(
    heartbeatTick,
    sessionInfo.status === 'issued'
      ? REFRESH_HEARTBEAT_INTERVAL_MILLISECONDS
      : null,
  );

  // Seed (and cancel) the schedule as login state changes.
  useEffect(() => {
    if (sessionInfo.status !== 'issued') {
      clearScheduledRefresh();
      return;
    }

    refreshFailuresRef.current = 0; // a fresh login starts from a clean backoff
    expiredRecoveryAttemptedRef.current = false;
    void rescheduleFromToken();

    return () => {
      clearScheduledRefresh();
    };
  }, [sessionInfo.status, rescheduleFromToken, clearScheduledRefresh]);

  // Catch up when the page comes back to life, from any of the three directions it
  // can: the tab is shown again, the window regains focus, or the network returns.
  //
  // These are not redundant. `visibilitychange` misses a window that stayed
  // visible while another application sat on top of it — hidden from the user, and
  // on some platforms throttled, without ever being `hidden` to the document.
  // `online` covers an outage that outlasted the token, where nothing about the
  // page's visibility changed at all. Whichever arrives first does the work and
  // the shared throttle below silences the rest.
  const lastCatchUpAtRef = useRef(0);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (sessionInfo.status !== 'issued') return;

    const catchUp = () => {
      const now = Date.now();
      if (now - lastCatchUpAtRef.current < CATCH_UP_THROTTLE_MILLISECONDS)
        return;
      lastCatchUpAtRef.current = now;

      // Coming back is the moment a dead token is worth one more attempt: this is
      // the case the shared backoff counter used to swallow. Bounded by the
      // throttle above, so flipping between tabs or windows cannot turn it into a
      // poll. The backoff counter itself is deliberately left alone — a failing
      // endpoint must not get fast retries again just because we came back.
      expiredRecoveryAttemptedRef.current = false;

      void rescheduleFromToken();
    };

    // A visibility change also fires on the way *out*, which is not a catch-up.
    const catchUpIfVisible = () => {
      if (document.visibilityState !== 'visible') return;
      catchUp();
    };

    document.addEventListener('visibilitychange', catchUpIfVisible);
    window.addEventListener('focus', catchUp);
    window.addEventListener('online', catchUp);

    return () => {
      document.removeEventListener('visibilitychange', catchUpIfVisible);
      window.removeEventListener('focus', catchUp);
      window.removeEventListener('online', catchUp);
    };
  }, [sessionInfo.status, rescheduleFromToken]);

  // Read through a ref so `endSession` — and therefore the context value — does
  // not change identity every time the router does, i.e. on every navigation.
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  // Logout ends in a navigation, and navigation is asynchronous, so the page
  // stays live for a while afterwards. Without this guard the inactivity tick can
  // re-enter and start a second logout in that window.
  const endingSessionRef = useRef(false);

  const endSession = useCallback(async (): Promise<void> => {
    if (endingSessionRef.current) return;
    endingSessionRef.current = true;

    let logoutError: unknown;

    try {
      await logoutSession(routerRef.current.basePath);
    } catch (error: unknown) {
      logoutError = error;
    }

    try {
      // Settle the store before navigating: until this lands, `userStatus` still
      // reads authenticated and the rest of the app acts as if nothing happened.
      await getUserDetails();
    } catch (error: unknown) {
      logoutError ??= error;
    }

    if (logoutError) {
      showNotification({
        title: 'Logout Error',
        message: `error logging out ${logoutError instanceof Error ? logoutError.message : 'unknown error'}`,
      });
    }

    // Logout is performed through our same-origin API, so this can remain a
    // client-side navigation. The provider (and an expiry modal) survives it.
    try {
      await routerRef.current.push(GEN3_REDIRECT_URL);
    } finally {
      endingSessionRef.current = false;
    }
  }, [getUserDetails]);

  /**
   * Check if the user session has ended
   */
  const isSessionActive = useThrottledCallback(() => {
    // Check session token, this call updates info
    void getUserDetails(undefined, true)
      .then((obj) => {
        // use cache value to prevent excessive calls to /user/user
        // check to make sure logged-out users are logged out
        if (
          obj.data?.loginStatus !== 'authenticated' &&
          userStatus === 'authenticated'
        ) {
          coreDispatch(showModal({ modal: Modals.SessionExpireModal }));
        }
      })
      .catch(() => {
        // A failed check is not evidence of a dead session, and the query keeps
        // its own error state. Swallow it rather than reject unhandled.
      });
  }, ACTIVITY_THROTTLE_TIMEOUT); // set the time between api calls

  // Unthrottled: programmatic renewals (the expiry warning's "Renew" button)
  // must always reset the inactivity clock, even inside a throttle window.
  const recordActivity = useCallback(() => {
    const timestamp = Date.now();
    if (SESSION_DEBUG_LOGGING) {
      // eslint-disable-next-line no-console
      console.log(
        `[session-inactivity] activity recorded at ${new Date(timestamp).toISOString()}`,
      );
    }
    setMostRecentActivityTimestamp(timestamp);

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'activity-update',
        timestamp,
      });
    }
  }, []);

  const updateUserActivity = useThrottledCallback(() => {
    recordActivity();
    if (sessionInfo.status === 'issued') isSessionActive();
  }, ACTIVITY_THROTTLE_TIMEOUT);

  // The warning modal id lives in a ref, not state, so the interval callback and
  // the unmount cleanup always see the current value.
  const expiryWarningIdRef = useRef<string | null>(null);

  const closeExpiryWarning = useCallback(() => {
    if (expiryWarningIdRef.current) {
      modals.close(expiryWarningIdRef.current);
      expiryWarningIdRef.current = null;
    }
  }, []);

  // Don't leave the warning modal orphaned if the provider unmounts.
  useEffect(() => closeExpiryWarning, [closeExpiryWarning]);

  const renewSession = useCallback(() => {
    if (SESSION_DEBUG_LOGGING) {
      // eslint-disable-next-line no-console
      console.log('[session-inactivity] renew requested from expiry warning');
    }
    closeExpiryWarning();
    recordActivity(); // the point of "Renew": restart the inactivity clock
    updateSession();
  }, [closeExpiryWarning, recordActivity, updateSession]);

  const logoutFromWarning = useCallback(() => {
    if (SESSION_DEBUG_LOGGING) {
      // eslint-disable-next-line no-console
      console.log('[session-inactivity] logout requested from expiry warning');
    }
    closeExpiryWarning();
    void endSession();
  }, [closeExpiryWarning, endSession]);

  // How far ahead of the inactivity limit the warning should appear.
  //
  // The window must be at least one poll wide, otherwise the tick that would
  // show the warning is the same tick that logs the user out, and it must leave
  // at least one poll of the inactivity window ahead of it, otherwise it fires
  // immediately after login. When the inactivity limit is too short to satisfy
  // both, there is no room for a warning and it is skipped.
  const warningLeadMilliseconds = useCallback(
    (activeLimitMilliseconds: number) => {
      if (
        expireWarningMilliseconds <= 0 ||
        updateSessionIntervalMilliseconds <= 0
      )
        return 0;
      const lead = Math.max(
        expireWarningMilliseconds,
        updateSessionIntervalMilliseconds,
      );
      return Math.min(
        lead,
        activeLimitMilliseconds - updateSessionIntervalMilliseconds,
      );
    },
    [expireWarningMilliseconds, updateSessionIntervalMilliseconds],
  );

  // Fetch session once on mount to establish initial auth state, then schedule expiry timers
  useEffect(() => {
    updateSession();
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Activity monitoring — only active while the user is logged in.
  // Re-registers listeners whenever the login state or the handler reference changes.
  useEffect(() => {
    if (updateSessionIntervalMilliseconds <= 0) return;
    if (sessionInfo.status !== 'issued') return;

    ACTIVITY_EVENTS.forEach(([type, options]) =>
      window.addEventListener(type, updateUserActivity, options),
    );

    return () => {
      ACTIVITY_EVENTS.forEach(([type, options]) =>
        window.removeEventListener(type, updateUserActivity, options),
      );
    };
  }, [
    sessionInfo.status,
    updateUserActivity,
    updateSessionIntervalMilliseconds,
  ]);

  useInterval(
    () => {
      const { pathname } = router;
      if (sessionInfo.status !== 'issued') return; // no need to update session if user is not logged in
      if (isUserOnPage('Login', pathname)) return;
      if (!logoutInactiveUsers) return;

      const timeSinceLastActivity = Date.now() - mostRecentActivityTimestamp;

      if (SESSION_DEBUG_LOGGING) {
        // eslint-disable-next-line no-console
        console.log(
          '[workspace-test]',
          pathname,
          isUserOnPage('Workspace', pathname),
        );

        console.log(
          '[workspace-test] workspaceInactivityTimeLimitMilliseconds',
          workspaceInactivityTimeLimitMilliseconds,
        );
      }

      const activeLimit = isUserOnPage('Workspace', pathname)
        ? workspaceInactivityTimeLimitMilliseconds
        : inactiveTimeLimitMilliseconds;

      if (SESSION_DEBUG_LOGGING) {
        // eslint-disable-next-line no-console
        console.log('[session-inactivity] tick', {
          pathname,
          lastActivityAt: new Date(mostRecentActivityTimestamp).toISOString(),
          idleSeconds: Math.round(timeSinceLastActivity / 1000),
          activeLimitSeconds: Math.round(activeLimit / 1000),
          warningShown: expiryWarningIdRef.current !== null,
        });
      }

      // A limit of 0 means no inactivity logout for this kind of page
      if (activeLimit <= 0) return;

      if (timeSinceLastActivity >= activeLimit) {
        if (SESSION_DEBUG_LOGGING) {
          // eslint-disable-next-line no-console
          console.log(
            '[session-inactivity] idle limit exceeded, ending session',
            {
              idleSeconds: Math.round(timeSinceLastActivity / 1000),
              activeLimitSeconds: Math.round(activeLimit / 1000),
            },
          );
        }
        closeExpiryWarning();
        coreDispatch(showModal({ modal: Modals.SessionExpireModal }));
        void endSession();
        return;
      }

      const warningLead = warningLeadMilliseconds(activeLimit);

      if (
        warningLead > 0 &&
        timeSinceLastActivity >= activeLimit - warningLead
      ) {
        if (!expiryWarningIdRef.current) {
          if (SESSION_DEBUG_LOGGING) {
            // eslint-disable-next-line no-console
            console.log('[session-inactivity] showing expiry warning', {
              minutesRemaining: Math.max(
                1,
                Math.round(warningLead / MILLISECONDS_PER_MINUTE),
              ),
            });
          }
          // Show warning before session expires, giving user a chance to act
          expiryWarningIdRef.current = modals.openContextModal({
            modal: 'sessionExpiringModal',
            title: 'Session Expiring',
            // Offer an explicit close control, but prevent accidental dismissal
            // through Escape or a click outside the modal.
            withCloseButton: true,
            closeOnClickOutside: false,
            closeOnEscape: false,
            // Belt and braces for a close we did not initiate (modals.closeAll
            // elsewhere, say) so the id never outlives the modal.
            onClose: () => {
              expiryWarningIdRef.current = null;
            },
            innerProps: {
              minutesRemaining: Math.max(
                1,
                Math.round(warningLead / MILLISECONDS_PER_MINUTE),
              ),
              onRenew: renewSession,
              onLogout: logoutFromWarning,
            },
          });
        }
        return;
      }

      // Take the warning down once the user is active again
      if (expiryWarningIdRef.current && SESSION_DEBUG_LOGGING) {
        // eslint-disable-next-line no-console
        console.log(
          '[session-inactivity] user active again, closing expiry warning',
        );
      }
      closeExpiryWarning();

      // Token refresh is handled by the exp-driven scheduler above — this
      // interval only tracks inactivity/logout timing.
    },
    updateSessionIntervalMilliseconds > 0
      ? updateSessionIntervalMilliseconds
      : null,
  );

  // Token metadata is only meaningful while logged in — deriving it here rather
  // than clearing the state on logout keeps the two in sync without an extra render.
  // `sessionInfo` is spread last so the login-derived `status` stays
  // authoritative over the token's own status field.
  const value: Session = useDeepCompareMemo(() => {
    const tokenData =
      sessionInfo.status === 'issued' ? authTokenData : undefined;
    return {
      issued: tokenData?.issued,
      expires: tokenData?.expires,
      userContext: tokenData?.userContext,
      ...sessionInfo,
      updateSession,
      endSession,
    };
  }, [authTokenData, sessionInfo, updateSession, endSession]);

  if (isGetCSRFError) {
    return (
      <Center h="100vh">
        {`Error from the commons services. They do not seem to be running`}
      </Center>
    );
  }

  if (isGetCSRFSuccess) {
    return (
      <SessionContext.Provider value={value}>
        {children}
      </SessionContext.Provider>
    );
  } else {
    if (isFetchingCSRF) {
      return (
        <Center h="100vh">
          <Loader />
        </Center>
      );
    } else // error
    {
      return (
        <Center h="100vh">
          {`Error from the commons services. They do not seem to be running`}
        </Center>
      );
    }
  }
};
