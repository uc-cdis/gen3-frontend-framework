import useSWR from "swr";
import { AuthTokenData, Session} from "./types";

const fetcher = (url: string) => fetch(url).then(r => r.json() as Promise<AuthTokenData>);

export const useSessionToken = (): AuthTokenData => {
  const { data: sessionTokens, error } = useSWR<AuthTokenData>("/api/auth/sessionToken", fetcher, { refreshInterval: 3000 });
  console.log("useSessionToken", sessionTokens, typeof window === "undefined" ? "server" : "client");
  return error || sessionTokens === undefined ? { ...sessionTokens, status: "error" } : sessionTokens;
}
