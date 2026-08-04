import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import { getCookie, hasCookie } from 'cookies-next';
import { useDeepCompareMemo } from 'use-deep-compare';
import { useManageSession } from './hooks';
import { showNotification } from '@mantine/notifications';
import type { AuthTokenData, Session, SessionProviderProps } from './types';
import { isUserOnPage } from './utils';
import {
  type CoreState,
  GEN3_FENCE_API,
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

import { minutesToMilliseconds, withBasePath } from '../../utils';
import { useWorkspaceResourceMonitor } from '../../components/Providers/ResourceMonitor';
import { modals } from '@mantine/modals';

const ACTIVITY_THROTTLE_TIMEOUT = 7000;

export const logoutSession = async () => {
  // logged in using credentials, then execute credentials logout first
  if (process.env.NODE_ENV === 'development') {
    const accessToken = getCookie('credentials_token');
    if (accessToken) {
      await fetch('/api/auth/credentialsLogout');
    }
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useOnline() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : false,
  );

  const setOnline = () => setIsOnline(true);
  const setOffline = () => setIsOnline(false);

  useEffect(() => {
    window.addEventListener('online', setOnline);
    window.addEventListener('offline', setOffline);

    return () => {
      window.removeEventListener('online', setOnline);
      window.removeEventListener('offline', setOffline);
    };
  }, []);

  return isOnline;
}

export const SessionContext = React.createContext<Session | undefined>(
  undefined,
);

/**
 *  We eventually want to use the session token to determine if the user is logged in
 *  as opposed to the user status since that check will happen on the server using httpOnly cookies
 *  and verification of the session token
 */
export const getSession = async (): Promise<AuthTokenData> => {
  try {
    const res = await fetch('/api/auth/sessionToken', { cache: 'no-store' });
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

  // Navigating is a side effect: doing it in the render body warns in React,
  // runs twice under StrictMode, and can loop when the target route also
  // renders a `required` consumer. Effects don't run on the server, so this
  // also replaces the previous explicit SSR guard.
  useEffect(() => {
    if (!isUnauthenticated) return;
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

type IntervalFunction = () => unknown | void;

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
const REFRESH_MARGIN_MILLISECONDS = minutesToMilliseconds(2);
// Floor for the scheduled refresh delay so a nearly-expired or already-expired
// token doesn't cause a tight refresh loop.
const MIN_REFRESH_DELAY_MILLISECONDS = 5000;
// When the token's expiry cannot be read (endpoint error, network blip) retry on
// a bounded backoff. Not retrying would leave the session with no scheduled
// refresh at all, silently logging the user out when the token expires.
const REFRESH_RETRY_BASE_MILLISECONDS = 30000;
const REFRESH_RETRY_MAX_MILLISECONDS = minutesToMilliseconds(5);

const MILLISECONDS_PER_MINUTE = minutesToMilliseconds(1);

const refreshDelayFromExpiry = (expiresSeconds: number) =>
  Math.max(
    MIN_REFRESH_DELAY_MILLISECONDS,
    expiresSeconds * 1000 - Date.now() - REFRESH_MARGIN_MILLISECONDS,
  );

const refreshRetryDelay = (attempt: number) =>
  Math.min(
    REFRESH_RETRY_MAX_MILLISECONDS,
    REFRESH_RETRY_BASE_MILLISECONDS * 2 ** attempt,
  );

/**
 * SessionProvider creates a React context which keeps track of wether the user is authenticated
 * and if their session is stale and logs them out if they do not preform an action in an alotted amount of time
 * @param children - Pass in a child session if one exists
 * @param session - Pass in a cached session if one exists
 * @param updateSessionTime - Interval of time between fetching session token
 * @param inactiveTimeLimit - Amount of time user is allowed to be inactive before getting logged out if user is tabbed away from page
 * @param workspaceInactivityTimeLimit - Amount of time user is allowed to be inactive if user is tabbed into the site
 * @param logoutInactiveUsers - Whether to log out users that are determined to be inactive or not
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

  const { isSuccess: isGetCSRFSuccess, isError: isGetCSRFError } =
    useGetCSRFQuery();
  useWorkspaceResourceMonitor(monitorWorkspace); // monitor workspaces if any are running or configured

  const [getUserDetails] = useLazyFetchUserDetailsQuery(); // Fetch user details
  const userStatus = useCoreSelector((state: CoreState) =>
    selectUserAuthStatus(state),
  );

  const [mostRecentActivityTimestamp, setMostRecentActivityTimestamp] =
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
    if (typeof window !== 'undefined') {
      broadcastChannelRef.current = new BroadcastChannel(ACTIVITY_CHANNEL);

      // Listen for activity updates from other tabs
      const handleActivityMessage = (event: MessageEvent) => {
        if (event.data.type === 'activity-update') {
          setMostRecentActivityTimestamp(event.data.timestamp);
        }
      };

      broadcastChannelRef.current.addEventListener(
        'message',
        handleActivityMessage,
      );

      return () => {
        if (broadcastChannelRef.current) {
          broadcastChannelRef.current.removeEventListener(
            'message',
            handleActivityMessage,
          );
          broadcastChannelRef.current.close();
        }
      };
    }
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
    void getUserDetails();
  }, [getUserDetails]);

  // Read the token metadata and mirror it into state for the context value.
  const syncAuthTokenData = useCallback(async (): Promise<AuthTokenData> => {
    const session = await getSession();
    // Don't clobber known-good data with a failed lookup.
    if (session.status !== 'error' && isMountedRef.current) {
      setAuthTokenData(session);
    }
    return session;
  }, []);

  // Proactive, expiry-driven token refresh.
  //
  // Fence reissues the access_token cookie every time /user is hit, so we
  // schedule exactly one refresh per token lifetime — timed from the token's
  // own `exp` claim (via /api/auth/sessionToken) rather than a fixed clock
  // that can drift into, or past, the real expiry.
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearScheduledRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  // The timer callback has to re-arm the timer; holding the latest
  // implementation in a ref avoids a circular useCallback dependency.
  const armRefreshTimerRef = useRef<(delay: number, attempt: number) => void>(
    () => {},
  );

  // Decide the next timer from a token read. `attempt` counts consecutive
  // failed reads so the retry backoff can grow.
  const scheduleFromTokenData = useCallback(
    (session: AuthTokenData, attempt: number) => {
      if (!isMountedRef.current) return;
      if (sessionStatusRef.current !== 'issued') return;

      if (session.expires) {
        armRefreshTimerRef.current(refreshDelayFromExpiry(session.expires), 0);
        return;
      }
      if (session.status === 'error') {
        armRefreshTimerRef.current(refreshRetryDelay(attempt), attempt + 1);
      }
      // Any other status ('not present' / 'invalid' / 'expired') means the token
      // is genuinely gone: there is nothing to refresh, and the login state will
      // settle to unauthenticated, which clears the schedule below.
    },
    [],
  );

  const performScheduledRefresh = useCallback(
    async (attempt: number) => {
      if (sessionStatusRef.current !== 'issued') return;

      let session: AuthTokenData = { status: 'error' };
      try {
        await getUserDetails();
        session = await syncAuthTokenData();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error: unknown) {
        // Leave `session` as 'error' so we retry rather than abandon the chain.
      }
      scheduleFromTokenData(session, attempt);
    },
    [getUserDetails, syncAuthTokenData, scheduleFromTokenData],
  );

  const armRefreshTimer = useCallback(
    (delay: number, attempt: number) => {
      clearScheduledRefresh();
      if (!isMountedRef.current) return;
      refreshTimeoutRef.current = setTimeout(() => {
        void performScheduledRefresh(attempt);
      }, delay);
    },
    [clearScheduledRefresh, performScheduledRefresh],
  );

  useEffect(() => {
    armRefreshTimerRef.current = armRefreshTimer;
  }, [armRefreshTimer]);

  // Re-derive the schedule from a freshly read token.
  const rescheduleFromToken = useCallback(async () => {
    scheduleFromTokenData(await syncAuthTokenData(), 0);
  }, [scheduleFromTokenData, syncAuthTokenData]);

  // Seed (and cancel) the schedule as login state changes.
  useEffect(() => {
    if (sessionInfo.status !== 'issued') {
      clearScheduledRefresh();
      return;
    }

    void rescheduleFromToken();

    return () => {
      clearScheduledRefresh();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionInfo.status]);

  // Catch up if the scheduled setTimeout was throttled while the tab was
  // backgrounded (browsers can pause/delay timers in inactive tabs well
  // beyond our refresh margin). Re-derive the schedule from the real token
  // expiry as soon as the tab is visible again.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (sessionInfo.status !== 'issued') return;

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      void rescheduleFromToken();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibility);
  }, [sessionInfo.status, rescheduleFromToken]);

  // Returns the logout chain so callers can await logout actually completing.
  const endSession = useCallback(async (): Promise<void> => {
    const isCredentialLogin = hasCookie('credentials_token');
    const basePath = router.basePath;

    await logoutSession()
      .then(() => getUserDetails())
      .catch((e) => {
        showNotification({
          title: 'Logout Error',
          message: `error logging out ${e.message}`,
        });
      })
      .finally(() => {
        if (isCredentialLogin) {
          // already logged out so just redirect
          void router.push(GEN3_REDIRECT_URL);
        } else {
          // need a fence redirect
          window.location.href = `${GEN3_FENCE_API}/logout?next=${withBasePath(basePath, GEN3_REDIRECT_URL)}`;
        }
      });
  }, [getUserDetails, router]);

  /**
   * Check if the user session has ended
   */
  const isSessionActive = useThrottledCallback(() => {
    // Check session token, this call updates info
    void getUserDetails(undefined, true).then((obj) => {
      // use cache value to prevent excessive calls to /user/user
      // check to make sure logged-out users are logged out
      if (
        obj?.data?.loginStatus !== 'authenticated' &&
        userStatus === 'authenticated'
      ) {
        coreDispatch(showModal({ modal: Modals.SessionExpireModal }));
      }
    });
  }, ACTIVITY_THROTTLE_TIMEOUT); // set the time between api calls

  // Unthrottled: programmatic renewals (the expiry warning's "Renew" button)
  // must always reset the inactivity clock, even inside a throttle window.
  const recordActivity = useCallback(() => {
    const timestamp = Date.now();
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
    closeExpiryWarning();
    recordActivity(); // the point of "Renew": restart the inactivity clock
    void getUserDetails();
  }, [closeExpiryWarning, recordActivity, getUserDetails]);

  const logoutFromWarning = useCallback(() => {
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
  }, []);

  // Activity monitoring — only active while the user is logged in.
  // Re-registers listeners whenever the login state or the handler reference changes,
  // which also fixes the stale closure bug (updateUserActivity captures sessionInfo).
  useEffect(() => {
    if (updateSessionIntervalMilliseconds <= 0) return;
    if (sessionInfo.status !== 'issued') return;

    window.addEventListener('mousedown', updateUserActivity);
    window.addEventListener('keypress', updateUserActivity);
    window.addEventListener('updateUserActivity', updateUserActivity);
    window.addEventListener('scroll', updateUserActivity);
    window.addEventListener('touchstart', updateUserActivity);

    return () => {
      window.removeEventListener('mousedown', updateUserActivity);
      window.removeEventListener('keypress', updateUserActivity);
      window.removeEventListener('updateUserActivity', updateUserActivity);
      window.removeEventListener('scroll', updateUserActivity);
      window.removeEventListener('touchstart', updateUserActivity);
    };
  }, [
    sessionInfo.status,
    updateUserActivity,
    updateSessionIntervalMilliseconds,
  ]);

  useInterval(
    () => {
      if (sessionInfo.status !== 'issued') return; // no need to update session if user is not logged in
      if (isUserOnPage('Login') /* || this.popupShown */) return;

      if (!logoutInactiveUsers) return;

      const timeSinceLastActivity = Date.now() - mostRecentActivityTimestamp;

      const activeLimit = isUserOnPage('Workspace')
        ? workspaceInactivityTimeLimitMilliseconds
        : inactiveTimeLimitMilliseconds;

      // A limit of 0 means no inactivity logout for this kind of page
      if (activeLimit <= 0) return;

      if (timeSinceLastActivity >= activeLimit) {
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
          // Show warning before session expires, giving user a chance to act
          expiryWarningIdRef.current = modals.openContextModal({
            modal: 'sessionExpiringModal',
            title: 'Session Expiring',
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

  if (isGetCSRFSuccess)
    return (
      <SessionContext.Provider value={value}>
        {children}
      </SessionContext.Provider>
    );
  else
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
};
