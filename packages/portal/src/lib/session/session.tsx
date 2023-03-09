import React, {
  createContext,
  useEffect,
  useContext,
  useState,
  useMemo,
} from "react";
import { now } from "../../utils";
import { Session, SessionProviderProps } from "./types";


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

export type SessionContextValue<R extends boolean = false> = R extends true
  ?
      | { data: Session; status: "authenticated" }
      | { data: null; status: "loading" }
  :
      | { data: Session; status: "authenticated" }
      | { data: null; status: "unauthenticated" | "loading" };

const SessionContext = React.createContext<SessionContextValue | undefined>(
  undefined,
);

export const useSession = () => {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error(
      "[gen3]: `useSession` must be wrapped in a <SessionProvider />",
    );
  }

  const requiredAndNotLoading = value.status === "unauthenticated";

  // useEffect(() => {
  //   if (requiredAndNotLoading) {
  //       router.push(`${GEN3_DOMAIN}/Login`);
  //   }
  // }, [requiredAndNotLoading]);

  if (requiredAndNotLoading) {
    return { data: value.data, status: "loading" } as const;
  }

  return value;
};

export const SessionProvider = ({
  children,
  session,
  refetchInterval = 0,
  refetchOnWindowFocus = true,
}: SessionProviderProps) => {
  const [data, setData] = useState<Session | null>(session ?? null);
  const [status, setStatus] = useState<
    "authenticated" | "unauthenticated" | "loading"
  >(session ? "authenticated" : "loading");

  /**
   * If session was `null`, there was an attempt to fetch it,
   * but it failed, but we still treat it as a valid initial value.
   */
  const hasInitialSession = session !== undefined;
  /*
   * If there was no initial session, we need to wait for the first fetch
   */
  const [loading, setLoading] = useState(!hasInitialSession);

  const isOnline = useOnline();

  const lastSync = hasInitialSession ? now() : 0;

  const value = useMemo(
    () =>
      ({
        data: session,
        status: loading
          ? "loading"
          : session
          ? "authenticated"
          : "unauthenticated",
      } as SessionContextValue),
    [session, loading],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};
