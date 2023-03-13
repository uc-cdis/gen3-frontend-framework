import React, { useEffect, useContext, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { Session, SessionProviderProps } from "./types";
import { useSessionToken } from "./hooks";
import { isUserOnPage } from "./utils";
import { useCoreSelector, selectUser, CoreState } from "@gen3/core";

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

const logoutUser = () => {
  if (typeof window === "undefined") return; // skip if this pages if on the server
  const router = useRouter();
  router.push("/user/logout");
};

const UPDATE_SESSION_LIMIT = MinutesToMilliseconds(5);

export const SessionProvider = ({
  children,
  session,
  updateSessionTime = 0,
  inactiveTimeLimit = 30,
  workspaceInactivityTimeLimit = 0,
  logoutInactiveUsers = false,
}: SessionProviderProps) => {
  const [mostRecentActivityTimestamp, setMostRecentActivityTimestamp] =
    useState(Date.now());

  const [
    mostRecentSessionRefreshTimestamp,
    setMostRecentSessionRefreshTimestamp,
  ] = useState(Date.now());

  const { data: user, loginStatus } = useCoreSelector((state: CoreState) =>
    selectUser(state),
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

  const updateUserActivity = () => {
    setMostRecentActivityTimestamp(Date.now());
  };

  const updateSession = () => {
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
        logoutUser();
        return;
      }
      if (
        mostRecentActivityTimestamp >=
          workspaceInactivityTimeLimitMilliseconds &&
        isUserOnPage("workspace")
      ) {
        logoutUser();
        return;
      }
    }
  };

  /**
   * Update session value every updateSessionInterval seconds
   */
  useEffect(() => {
    if (updateSessionIntervalMilliseconds <= 0) return; // do not poll if updateSessionInterval is 0
    const interval = setInterval(() => {
      updateSession();
    }, updateSessionIntervalMilliseconds);

    return () => clearInterval(interval);
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
