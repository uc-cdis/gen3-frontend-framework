import React, { useEffect, useContext, useState, useMemo } from 'react';
import { useRouter, NextRouter } from 'next/router';
import { Session, SessionProviderProps } from './types';
import { isUserOnPage } from './utils';
import {
  fetchUserState,
  CoreDispatch,
  useCoreDispatch,
  GEN3_DOMAIN,
} from '@gen3/core';

const SecondsToMilliseconds = (seconds: number) => seconds * 1000;
const MinutesToMilliseconds = (minutes: number) => minutes * 60 * 1000;

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

const SessionContext = React.createContext<Session | undefined>(undefined);

const getSession = async () => {
  try {
    const res = await fetch('/api/auth/sessionToken');
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
        // route not available on SSR
        return session;
      router.push('/Login');
    }
  }

  return session;
};

const logoutUser = (router: NextRouter) => {
  if (typeof window === 'undefined') return; // skip if this pages if on the server
  router.push(`${GEN3_DOMAIN}/user/logout?next=${GEN3_DOMAIN}/`);
};

const UPDATE_SESSION_LIMIT = MinutesToMilliseconds(5);

export const SessionProvider = ({
  children,
  session,
  updateSessionTime = 0.3,
  inactiveTimeLimit = 2,
  workspaceInactivityTimeLimit = 0,
  logoutInactiveUsers = true,
}: SessionProviderProps) => {
  const router = useRouter();
  const coreDispatch = useCoreDispatch();
  const [sessionInfo, setSessionInfo] = useState(
    session ??
      ({
        status: 'not present',
      } as Session),
  );
  const [pending, setPending] = useState(session ? false : true);
  const [mostRecentActivityTimestamp, setMostRecentActivityTimestamp] =
    useState(Date.now());

  const [
    mostRecentSessionRefreshTimestamp,
    setMostRecentSessionRefreshTimestamp,
  ] = useState(Date.now());

  const inactiveTimeLimitMilliseconds =
    MinutesToMilliseconds(inactiveTimeLimit);
  const updateSessionTimeMilliseconds =
    MinutesToMilliseconds(updateSessionTime);
  const workspaceInactivityTimeLimitMilliseconds = MinutesToMilliseconds(
    workspaceInactivityTimeLimit,
  );
  const updateSessionIntervalMilliseconds =
    MinutesToMilliseconds(updateSessionTime);

  const checkAndRefrestSession = (dispatch: CoreDispatch) => {
    if (sessionInfo.status != 'issued') return; // no need to update session if user is not logged in
    if (isUserOnPage('Login') /* || this.popupShown */) return;

    const timeSinceLastActivity = Date.now() - mostRecentActivityTimestamp;

    if (logoutInactiveUsers) {
      if (
        timeSinceLastActivity >= inactiveTimeLimitMilliseconds &&
        !isUserOnPage('workspace')
      ) {
        logoutUser(router);
        return;
      }
      if (
        timeSinceLastActivity >= workspaceInactivityTimeLimitMilliseconds &&
        isUserOnPage('workspace')
      ) {
        logoutUser(router);
        return;
      }
    }
    // fetching a userState will renew the session
    refreshSession(dispatch);
  };

  const refreshSession = (dispatch: CoreDispatch) => {
    const timeSinceLastSessionUpdate =
      Date.now() - mostRecentSessionRefreshTimestamp;
    // don't hit Fence to refresh tokens too frequently
    if (timeSinceLastSessionUpdate < UPDATE_SESSION_LIMIT) {
      return;
    }

    // hitting Fence endpoint refreshes token
    setMostRecentSessionRefreshTimestamp(Date.now());
    dispatch(fetchUserState());
  };

  /**
   * Update session value every updateSessionInterval seconds
   */
  useEffect(() => {
    if (updateSessionIntervalMilliseconds <= 0) return; // do not poll if updateSessionInterval is 0

    const updateSession = async () => {
      const tokenStatus = await getSession();
      setSessionInfo({
        ...tokenStatus,
      });
      setPending(false);
    };

    const updateUserActivity = () => {
      setMostRecentActivityTimestamp(Date.now());
    };

    window.addEventListener('mousedown', updateUserActivity);
    window.addEventListener('keypress', updateUserActivity);

    const interval = setInterval(() => {
      checkAndRefrestSession(coreDispatch);
    }, updateSessionIntervalMilliseconds);

    updateSession();

    return () => {
      window.removeEventListener('mousedown', updateUserActivity);
      window.removeEventListener('keypress', updateUserActivity);
      clearInterval(interval);
    };
  }, []);

  const value: Session = useMemo(() => {
    return {
      ...sessionInfo,
      pending: pending,
    };
  }, [pending, sessionInfo]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};
