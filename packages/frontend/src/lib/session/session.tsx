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
import type { Session, SessionProviderProps } from './types';
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
export const getSession = async () => {
  try {
    const res = await fetch('/api/auth/sessionToken', { cache: 'no-store' });
    if (res.status === 200) {
      return await res.json();
    }
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
  if (!session) {
    throw new Error(
      '[gen3]: `useSession` must be wrapped in a <SessionProvider />',
    );
  }

  if (required && !session.pending && session.status !== 'issued') {
    if (onUnauthenticated) {
      onUnauthenticated();
    } else {
      if (typeof window === 'undefined')
        // route is not available on SSR
        return session;
      void router.push('Login');
    }
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

// How long before the access token's real expiry (decoded from the JWT, not
// guessed from `updateSessionTime`) we proactively refresh it. Refreshing
// against the token's own `exp` means we hit Fence's /user endpoint at most
// once per token lifetime instead of on a fixed clock that can drift into
// (or past) the actual expiry.
const REFRESH_MARGIN_MILLISECONDS = minutesToMilliseconds(2);
// Floor for the scheduled refresh delay so a nearly-expired or already-expired
// token doesn't cause a tight refresh loop.
const MIN_REFRESH_DELAY_MILLISECONDS = 5000;

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
  const [expiryWarningShown, setExpiryWarningShown] = useState<string | null>(
    null,
  );

  const inactiveTimeLimitMilliseconds =
    minutesToMilliseconds(inactiveTimeLimit);

  const workspaceInactivityTimeLimitMilliseconds = minutesToMilliseconds(
    workspaceInactivityTimeLimit,
  );
  const updateSessionIntervalMilliseconds =
    minutesToMilliseconds(updateSessionTime);

  // update session status using the user status

  const sessionInfo = useManageSession(userStatus);

  // for now, we are using the user status to determine if the user is logged in
  const updateSession = useCallback(() => {
    void getUserDetails();
  }, [getUserDetails]);

  // Proactive, expiry-driven token refresh.
  //
  // Fence reissues the access_token cookie every time /user is hit, so we
  // schedule exactly one refresh per token lifetime — timed from the token's
  // own `exp` claim (via /api/auth/sessionToken) rather than a fixed clock
  // that can drift into, or past, the real expiry.
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Holds the latest scheduleNextRefresh so performScheduledRefresh (defined
  // first, for readability) can reschedule itself without a circular useCallback dependency.
  const scheduleNextRefreshRef = useRef<(expiresSeconds: number) => void>(
    () => {},
  );

  const clearScheduledRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  const performScheduledRefresh = useCallback(async () => {
    await getUserDetails();
    const session = await getSession();
    if (session?.expires) {
      scheduleNextRefreshRef.current(session.expires);
    }
  }, [getUserDetails]);

  const scheduleNextRefresh = useCallback(
    (expiresSeconds: number) => {
      clearScheduledRefresh();
      const delay = Math.max(
        MIN_REFRESH_DELAY_MILLISECONDS,
        expiresSeconds * 1000 - Date.now() - REFRESH_MARGIN_MILLISECONDS,
      );
      refreshTimeoutRef.current = setTimeout(() => {
        void performScheduledRefresh();
      }, delay);
    },
    [clearScheduledRefresh, performScheduledRefresh],
  );

  useEffect(() => {
    scheduleNextRefreshRef.current = scheduleNextRefresh;
  }, [scheduleNextRefresh]);

  // Seed (and cancel) the schedule as login state changes.
  useEffect(() => {
    if (sessionInfo.status !== 'issued') {
      clearScheduledRefresh();
      return;
    }

    let cancelled = false;
    void (async () => {
      const session = await getSession();
      if (!cancelled && session?.expires) {
        scheduleNextRefresh(session.expires);
      }
    })();

    return () => {
      cancelled = true;
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
      void (async () => {
        const session = await getSession();
        if (session?.expires) {
          scheduleNextRefresh(session.expires);
        }
      })();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibility);
  }, [sessionInfo.status, scheduleNextRefresh]);

  const endSession = useCallback(async () => {
    const isCredentialLogin = hasCookie('credentials_token');
    const basePath = router.basePath;

    logoutSession()
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
        obj?.data?.loginStatus != 'authenticated' &&
        userStatus === 'authenticated'
      ) {
        coreDispatch(showModal({ modal: Modals.SessionExpireModal }));
      }
    });
  }, ACTIVITY_THROTTLE_TIMEOUT); // set the time between api calls

  const updateUserActivity = useThrottledCallback(() => {
    const timestamp = Date.now();
    setMostRecentActivityTimestamp(timestamp);

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'activity-update',
        timestamp,
      });
    }
    if (sessionInfo.status === 'issued') isSessionActive();
  }, ACTIVITY_THROTTLE_TIMEOUT);

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

      const timeSinceLastActivity = Date.now() - mostRecentActivityTimestamp;

      if (logoutInactiveUsers) {
        const onWorkspacePage = isUserOnPage('Workspace');
        const activeLimit = onWorkspacePage
          ? workspaceInactivityTimeLimitMilliseconds
          : inactiveTimeLimitMilliseconds;

        // Skip workspace-specific limit if it's disabled (0)
        if (onWorkspacePage && workspaceInactivityTimeLimitMilliseconds <= 0) {
          // No workspace inactivity limit configured — don't log out
        } else if (timeSinceLastActivity >= activeLimit) {
          coreDispatch(showModal({ modal: Modals.SessionExpireModal }));
          void endSession().then(() => {});
          return;
        } else if (
          expireWarningMilliseconds > 0 &&
          !expiryWarningShown &&
          timeSinceLastActivity >= activeLimit - expireWarningMilliseconds
        ) {
          // Show warning before session expires, giving user a chance to act

          const expireModalId = modals.openContextModal({
            modal: 'sessionExpiringModal',
            title: 'Session Expiring',
            innerProps: {
              minutesRemaining: expireWarningMinutes,
              onRenew: () => {
                void getUserDetails();
              },
              onLogout: () => {
                void endSession();
              },
            },
          });
          setExpiryWarningShown(expireModalId);
          return;
        }

        // Reset warning flag once user becomes active again
        if (
          expiryWarningShown &&
          timeSinceLastActivity < activeLimit - expireWarningMilliseconds
        ) {
          modals.close(expiryWarningShown);
          setExpiryWarningShown(null);
        }
      }
      // Token refresh is handled by the exp-driven scheduler above — this
      // interval only tracks inactivity/logout timing.
    },
    updateSessionIntervalMilliseconds > 0
      ? updateSessionIntervalMilliseconds
      : null,
  );

  const value: Session = useDeepCompareMemo(() => {
    return {
      ...sessionInfo,
      updateSession,
      endSession,
    };
  }, [sessionInfo, updateSession, endSession]);

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
