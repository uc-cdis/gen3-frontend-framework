import { createContext, useEffect, useContext } from "react";
import { Session, UseSessionOptions } from "./types";

export type SessionContextValue<R extends boolean = false> = R extends true
  ?
  | { data: Session; status: "authenticated" }
  | { data: null; status: "loading" }
  :
  | { data: Session; status: "authenticated" }
  | { data: null; status: "unauthenticated" | "loading" }

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined
);

export function useSession<R extends boolean>(options?: UseSessionOptions<R>) {
  // @ts-expect-error Satisfy TS if branch on line below
  const value: SessionContextValue<R> = useContext(SessionContext);
  if (!value && process.env.NODE_ENV !== "production") {
    throw new Error(
      "[gen3]: `useSession` must be wrapped in a <SessionProvider />"
    );
  }

  const { required, onUnauthenticated } = options ?? {};
  const requiredAndNotLoading = required && value.status === "unauthenticated";

  useEffect(() => {
    if (requiredAndNotLoading) {
      const url = "/";
      if (onUnauthenticated) onUnauthenticated();
      else window.location.href = url;
    }
  }, [requiredAndNotLoading, onUnauthenticated]);

  if (requiredAndNotLoading) {
    return { data: value.data, status: "loading" } as const;
  }

  return value;
}
