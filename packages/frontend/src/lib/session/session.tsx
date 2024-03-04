import React, { useEffect, useContext, useRef, useState, useMemo } from 'react';
import { useRouter, NextRouter } from 'next/router';
import { Session, SessionProviderProps } from './types';
import { isUserOnPage } from './utils';
import {
  fetchUserState,
  CoreDispatch,
  useCoreDispatch,
  GEN3_API,
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
      router.push('Login');
    }
  }

  return session;
};

const logoutUser = (router: NextRouter) => {
  if (typeof window === 'undefined') return; // skip if this pages is on the server
  console.log('logging out user', GEN3_API);
  router.push(`${GEN3_API}/user/logout?next=/`);
};

const refreshSession = (dispatch: CoreDispatch,
                        mostRecentSessionRefreshTimestamp:number,
                        updateSessionRefreshTimestamp: (arg0:number)=>void ) : void => {
  const timeSinceLastSessionUpdate =
    Date.now() - mostRecentSessionRefreshTimestamp;
  // don't hit Fence to refresh tokens too frequently
  if (timeSinceLastSessionUpdate < UPDATE_SESSION_LIMIT) {
    return;
  }

  // hitting Fence endpoint refreshes token
  updateSessionRefreshTimestamp(Date.now());
  dispatch(fetchUserState());
};


type IntervalFunction = () => ( unknown | void )

const  useInterval = ( callback: IntervalFunction, delay: number | null ) => {

  const savedCallback = useRef<IntervalFunction| null>( null );

  useEffect( () => {
    if (delay === null) return;
    savedCallback.current = callback;
  } );

  useEffect( () => {
    if (delay === null) return;
    function tick() {
      if ( savedCallback.current !== null ) {
        savedCallback.current();
      }
    }
    const id = setInterval( tick, delay );
    return () => clearInterval( id );

  }, [ delay ] );
};


const UPDATE_SESSION_LIMIT = MinutesToMilliseconds(5);

export const SessionProvider = ({
  children,
  session,
  updateSessionTime = 5,
  inactiveTimeLimit = 20,
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

  const workspaceInactivityTimeLimitMilliseconds = MinutesToMilliseconds(
    workspaceInactivityTimeLimit,
  );
  const updateSessionIntervalMilliseconds =
    MinutesToMilliseconds(updateSessionTime);

  const updateSession = async () => {
    const tokenStatus = await getSession();

    setSessionInfo(tokenStatus);

    setPending(false);
  };
  /**
   * Update session value every updateSessionInterval seconds
   */
  useEffect(() => {
    updateSession();

    if (updateSessionIntervalMilliseconds <= 0) return; // do not poll if updateSessionInterval is 0

    const updateUserActivity = () => {
      setMostRecentActivityTimestamp(Date.now());
    };

    window.addEventListener('mousedown', updateUserActivity);
    window.addEventListener('keypress', updateUserActivity);

    return () => {
      window.removeEventListener('mousedown', updateUserActivity);
      window.removeEventListener('keypress', updateUserActivity);
    };
  }, []);

  useInterval(() => {

    console.log("sessionInfo.status", sessionInfo.status);
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
          workspaceInactivityTimeLimitMilliseconds > 0  && timeSinceLastActivity >= workspaceInactivityTimeLimitMilliseconds &&
          isUserOnPage('workspace')
        ) {
          logoutUser(router);
          return;
        }
      }
      // fetching a userState will renew the session
      refreshSession(coreDispatch, mostRecentSessionRefreshTimestamp, (ts:number) => setMostRecentSessionRefreshTimestamp(ts));
      updateSession();

  }, updateSessionIntervalMilliseconds > 0 ? updateSessionIntervalMilliseconds : null  );

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
