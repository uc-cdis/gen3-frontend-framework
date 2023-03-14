import React, { useEffect, useContext, useState, useMemo } from "react";
import { useRouter, NextRouter } from "next/router";
import { Session, SessionProviderProps } from "./types";
import { useSessionToken } from "./hooks";
import { isUserOnPage } from "./utils";
import { useCoreSelector, selectUser, CoreState, CoreDispatch, useCoreDispatch, GEN3_DOMAIN } from "@gen3/core";
import { fetchUserState } from "@gen3/core";

const SecondsToMilliseconds = (seconds: number) => seconds * 1000;
const MinutesToMilliseconds = (minutes: number) => minutes * 60 * 1000;

function useOnline() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : false,
  );

  const setOnline = () => setIsOnline(true);
  const setOffline = () => setIsOnline(false);

  useEffect(() => {
    window.addEventListener("online", setOnline);
    window.addEventListener("offline", setOffline);

    return () => {
      window.removeEventListener("online", setOnline);
      window.removeEventListener("offline", setOffline);
    };
  }, []);

  return isOnline;
}

const SessionContext = React.createContext<Session | undefined>(undefined);

export interface UseSessionOptions {
  required?: boolean;
  /** Defaults to `signIn` */
  onUnauthenticated?: () => void;
}
export const useSession = ({
  required = false,
  onUnauthenticated,
}: UseSessionOptions) => {
  const router = useRouter();
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error(
      "[gen3]: `useSession` must be wrapped in a <SessionProvider />",
    );
  }

  if (required && value.userStatus === "unauthenticated") {
    if (onUnauthenticated) {
      onUnauthenticated();
    } else {
      if (typeof window === "undefined")
        // route not available on SSR
        return value;
      router.push("/Login");
    }
  }

  return value;
};

const logoutUser = (router : NextRouter ) => {
  if (typeof window === "undefined") return; // skip if this pages if on the server
  router.push(`${GEN3_DOMAIN}/user/logout?next=${GEN3_DOMAIN}/`)
};

const UPDATE_SESSION_LIMIT = MinutesToMilliseconds(5);

export const SessionProvider = ({
  children,
  session,
  updateSessionTime = 60,
  inactiveTimeLimit = 30,
  workspaceInactivityTimeLimit = 0,
  logoutInactiveUsers = true,
}: SessionProviderProps) => {
  const router = useRouter();
  const coreDispatch = useCoreDispatch();
  const [mostRecentActivityTimestamp, setMostRecentActivityTimestamp] =
    useState(Date.now());

  const [
    mostRecentSessionRefreshTimestamp,
    setMostRecentSessionRefreshTimestamp,
  ] = useState(Date.now());

  const { data : user, loginStatus } = useCoreSelector((state: CoreState) =>
    selectUser(state)
  );
  const tokenStatus = useSessionToken();
  const [sessionValue, setSessionValue] = useState<Session>(
    session ?? {
      ...tokenStatus,
      userStatus: loginStatus,
      user: user,
    },
  );

  const inactiveTimeLimitMilliseconds =
    MinutesToMilliseconds(inactiveTimeLimit);
  const updateSessionTimeMilliseconds =
    MinutesToMilliseconds(updateSessionTime);
  const workspaceInactivityTimeLimitMilliseconds = MinutesToMilliseconds(
    workspaceInactivityTimeLimit,
  );
  const updateSessionIntervalMilliseconds =
    MinutesToMilliseconds(updateSessionTime);



  const updateSession = (dispatch: CoreDispatch ) => {
    if (loginStatus != "authenticated") return; // no need to update session if user is not logged in
    if (isUserOnPage("login") /* || this.popupShown */) return;

    const timeSinceLastSessionUpdate =
      Date.now() - mostRecentSessionRefreshTimestamp;
    if (timeSinceLastSessionUpdate < UPDATE_SESSION_LIMIT) return;

    if (logoutInactiveUsers) {
      if (
        mostRecentActivityTimestamp >= inactiveTimeLimitMilliseconds &&
        !isUserOnPage("workspace")
      ) {
        logoutUser(router);
        return;
      }
      if (
        mostRecentActivityTimestamp >=
          workspaceInactivityTimeLimitMilliseconds &&
        isUserOnPage("workspace")
      ) {
        logoutUser(router);
        return;
      }
    }
    // fetching a userState will renew the session
    refreshSession(dispatch);

  };

  const refreshSession = (dispatch: CoreDispatch) => {
    const timeSinceLastSessionUpdate = Date.now() - mostRecentSessionRefreshTimestamp;
    // don't hit Fence to refresh tokens too frequently
    if (timeSinceLastSessionUpdate < UPDATE_SESSION_LIMIT) {
      return;
    }

    // hitting Fence endpoint refreshes token
    setMostRecentSessionRefreshTimestamp(Date.now());
    dispatch(fetchUserState());
  }

  /**
   * Update session value every updateSessionInterval seconds
   */
  useEffect(() => {

    if (updateSessionIntervalMilliseconds <= 0) return; // do not poll if updateSessionInterval is 0

    const updateUserActivity = () => {
      setMostRecentActivityTimestamp(Date.now());
    };

    window.addEventListener('mousedown', () => updateUserActivity() );
    window.addEventListener('keypress', () => updateUserActivity() );

    const interval = setInterval(() => {
      updateSession(coreDispatch);
    }, updateSessionIntervalMilliseconds);

    return () => {
      window.removeEventListener('mousedown', updateUserActivity );
      window.removeEventListener('keypress', updateUserActivity );
      clearInterval(interval);
    }
  });

  const value: Session = useMemo(() => {
    console.log("updated session value", tokenStatus);
    return {
      ...tokenStatus,
      userStatus: loginStatus,
      user: user,
    };
  }, [loginStatus, tokenStatus, user]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};
