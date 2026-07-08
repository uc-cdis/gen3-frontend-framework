import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { SessionExpiringModal } from '../../components/Modals/SessionExpiringModal';
import { useRouter } from 'next/router';
import { getCookie, hasCookie } from 'cookies-next';
import { useDeepCompareMemo } from 'use-deep-compare';
import { useManageSession } from './hooks';
import { showNotification } from '@mantine/notifications';
import { Session, SessionProviderProps } from './types';
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

import { MinutesToMilliseconds } from '../../utils';
import { useWorkspaceResourceMonitor } from '../../components/Providers/ResourceMonitor';

export const logoutSession = async () => {
  // logged in using credentials then execute credentials logout first
  const accessToken = getCookie('credentials_token');
  if (accessToken) {
    await fetch('/api/auth/credentialsLogout');
  }
};

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
  } catch (error) {
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
      router.push('Login');
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

const refreshSession = (
  getUserDetails: () => void,
  mostRecentSessionRefreshTimestamp: number,
  updateSessionRefreshTimestamp: (arg0: number) => void,
): void => {
  const timeSinceLastSessionUpdate =
    Date.now() - mostRecentSessionRefreshTimestamp;
  // don't hit Fence to refresh tokens too frequently
  if (timeSinceLastSessionUpdate < UPDATE_SESSION_LIMIT) {
    return;
  }

  // hitting Fence endpoint refreshes the token
  updateSessionRefreshTimestamp(Date.now());
  getUserDetails();
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

const UPDATE_SESSION_LIMIT = MinutesToMilliseconds(5);

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
  expiryWarningMinutes = 5,
}: SessionProviderProps) => {
  const router = useRouter();
  const coreDispatch = useCoreDispatch();

  const { isSuccess: isGetCSRFSuccess, isError: isGetCSRFError } =
    useGetCSRFQuery();
  useWorkspaceResourceMonitor(monitorWorkspace); // monitor workspaces if any are running or configured
  const isOnline = useOnline();

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

  const [
    mostRecentSessionRefreshTimestamp,
    setMostRecentSessionRefreshTimestamp,
  ] = useState(Date.now());

  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs so the visibilitychange handler always sees the latest values
  // without needing to add high-frequency state to its dependency array.
  const mostRecentActivityTimestampRef = useRef(mostRecentActivityTimestamp);
  const sessionExpiryMsRef = useRef<number | null>(null);

  useEffect(() => {
    mostRecentActivityTimestampRef.current = mostRecentActivityTimestamp;
  }, [mostRecentActivityTimestamp]);

  const inactiveTimeLimitMilliseconds =
    MinutesToMilliseconds(inactiveTimeLimit);

  const workspaceInactivityTimeLimitMilliseconds = MinutesToMilliseconds(
    workspaceInactivityTimeLimit,
  );
  const updateSessionIntervalMilliseconds =
    MinutesToMilliseconds(updateSessionTime);

  // update session status using the user status

  const sessionInfo = useManageSession(userStatus);

  // for now, we are using the user status to determine if the user is logged in
  const updateSession = useCallback(() => {
    const updateSessionWithUserStatus = async () => {
      await getUserDetails();
    };

    updateSessionWithUserStatus();
  }, [getUserDetails]);

  const endSession = useCallback(async () => {
    const isCredentialLogin = await hasCookie('credentials_token')!;

    logoutSession()
      .then(() => {
        getUserDetails();
      })
      .catch((e) => {
        showNotification({
          title: 'Logout Error',
          message: `error logging out ${e.message}`,
        });
      })
      .finally(() => {
        if (isCredentialLogin) {
          router.push(GEN3_REDIRECT_URL);
        } else
          router.push(`${GEN3_FENCE_API}/logout?next=${GEN3_REDIRECT_URL}`);
      });
  }, [getUserDetails, router]);

  const clearExpiryTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  }, []);

  const scheduleExpiryTimers = useCallback(
    (expiresUnixSec: number) => {
      clearExpiryTimers();
      const now = Date.now();
      const expiresMs = expiresUnixSec * 1000;
      sessionExpiryMsRef.current = expiresMs;
      const warningMs = expiresMs - expiryWarningMinutes * 60 * 1000;
      const expiryDelay = expiresMs - now;

      if (expiryDelay <= 0) {
        coreDispatch(showModal({ modal: Modals.SessionExpireModal }));
        return;
      }

      if (warningMs - now > 0) {
        warningTimerRef.current = setTimeout(() => {
          setShowExpiryWarning(true);
        }, warningMs - now);
      } else {
        // Warning window already passed but token still valid — show immediately
        setShowExpiryWarning(true);
      }

      expiryTimerRef.current = setTimeout(() => {
        setShowExpiryWarning(false);
        coreDispatch(showModal({ modal: Modals.SessionExpireModal }));
      }, expiryDelay);
    },
    [clearExpiryTimers, coreDispatch, expiryWarningMinutes],
  );

  const checkAndScheduleSession = useCallback(async () => {
    const session = await getSession();
    if (!session) return;

    if (session.status === 'expired') {
      clearExpiryTimers();
      coreDispatch(showModal({ modal: Modals.SessionExpireModal }));
      return;
    }

    if (session.status === 'issued' && session.expires) {
      scheduleExpiryTimers(session.expires);
    }
  }, [clearExpiryTimers, coreDispatch, scheduleExpiryTimers]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => clearExpiryTimers();
  }, [clearExpiryTimers]);

  /**
   * Check if the user session has ended
   */
  const isSessionActive = useThrottledCallback(() => {
    //Check session token, this call updates info
    getUserDetails().then((obj) => {
      //check to make sure logged-out users are logged out
      if (
        obj?.data?.loginStatus != 'authenticated' &&
        userStatus === 'authenticated'
      ) {
        coreDispatch(showModal({ modal: Modals.SessionExpireModal }));
      }
    });
  }, 5000); // set the time between api calls

  const updateUserActivity = useCallback(() => {
    const timestamp = Date.now();
    setMostRecentActivityTimestamp(timestamp);

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'activity-update',
        timestamp,
      });
    }
    if (sessionInfo.status === 'issued') isSessionActive();
  }, [isSessionActive, sessionInfo]);

  // Fetch session once on mount to establish initial auth state, then schedule expiry timers
  useEffect(() => {
    getUserDetails().then(() => checkAndScheduleSession());
  }, []);

  // Activity monitoring — only active while the user is logged in.
  // Re-registers listeners whenever login state or the handler reference changes,
  // which also fixes the stale closure bug (updateUserActivity captures sessionInfo).
  useEffect(() => {
    if (updateSessionIntervalMilliseconds <= 0) return;
    if (sessionInfo.status !== 'issued') return;

    window.addEventListener('mousedown', updateUserActivity);
    window.addEventListener('keypress', updateUserActivity);
    window.addEventListener('updateUserActivity', updateUserActivity);
    window.addEventListener('scroll', updateUserActivity);
    window.addEventListener('click', updateUserActivity);
    window.addEventListener('touchstart', updateUserActivity);

    return () => {
      window.removeEventListener('mousedown', updateUserActivity);
      window.removeEventListener('keypress', updateUserActivity);
      window.removeEventListener('updateUserActivity', updateUserActivity);
      window.removeEventListener('scroll', updateUserActivity);
      window.removeEventListener('click', updateUserActivity);
      window.removeEventListener('touchstart', updateUserActivity);
    };
  }, [
    sessionInfo.status,
    updateUserActivity,
    updateSessionIntervalMilliseconds,
  ]);

  // On tab focus, refresh only when warranted: token is near expiry OR the user
  // has been inactive for more than 5 minutes.  Using refs for the two
  // high-frequency values avoids re-registering the listener on every activity event.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      if (sessionInfo.status !== 'issued') return;

      const timeSinceLastActivity =
        Date.now() - mostRecentActivityTimestampRef.current;
      const isNearExpiry =
        sessionExpiryMsRef.current !== null &&
        sessionExpiryMsRef.current - Date.now() <=
          expiryWarningMinutes * 60 * 1000;
      const wasInactive = timeSinceLastActivity >= MinutesToMilliseconds(5);

      if (isNearExpiry || wasInactive) {
        getUserDetails().then(() => checkAndScheduleSession());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [
    sessionInfo.status,
    expiryWarningMinutes,
    getUserDetails,
    checkAndScheduleSession,
  ]);

  useInterval(
    () => {
      if (sessionInfo.status != 'issued') return; // no need to update session if user is not logged in
      if (isUserOnPage('Login') /* || this.popupShown */) return;

      const timeSinceLastActivity = Date.now() - mostRecentActivityTimestamp;
      if (logoutInactiveUsers) {
        if (
          timeSinceLastActivity >= inactiveTimeLimitMilliseconds &&
          !isUserOnPage('Workspace')
        ) {
          coreDispatch(showModal({ modal: Modals.SessionExpireModal }));
          endSession();
          return;
        }
        if (
          workspaceInactivityTimeLimitMilliseconds > 0 &&
          timeSinceLastActivity >= workspaceInactivityTimeLimitMilliseconds &&
          isUserOnPage('Workspace')
        ) {
          coreDispatch(showModal({ modal: Modals.SessionExpireModal }));
          endSession();
          return;
        }
      }
      // fetching a userState will renew the session (rate-limited by refreshSession)
      // after refresh, re-fetch expiry and reschedule timers
      refreshSession(
        async () => {
          await getUserDetails();
          checkAndScheduleSession();
        },
        mostRecentSessionRefreshTimestamp,
        (ts: number) => setMostRecentSessionRefreshTimestamp(ts),
      );
    },
    isOnline && updateSessionIntervalMilliseconds > 0
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
        <SessionExpiringModal
          openModal={showExpiryWarning}
          minutesRemaining={expiryWarningMinutes}
          onRenew={() => {
            setShowExpiryWarning(false);
            clearExpiryTimers();
            getUserDetails().then(() => checkAndScheduleSession());
          }}
          onLogout={() => {
            setShowExpiryWarning(false);
            clearExpiryTimers();
            endSession();
          }}
        />
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
