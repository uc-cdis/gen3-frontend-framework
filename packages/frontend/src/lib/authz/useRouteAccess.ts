// lib/arborist/useRouteAccess.ts
import useSWR from 'swr';
import { useSession } from '../../lib/session/session';

type RouteRule = {
  loginRequired?: boolean;
  authzResources?: string[];
};
type RouteConfig = Record<string, RouteRule>;

interface ArboristApiResponse {
  disabled: boolean;
  resources: string[];
  routeConfig: RouteConfig;
}

interface RouteAccessResult {
  loading: boolean;
  error?: Error;
  isProtected: boolean;
  loginRequired: boolean;
  authzRequired: boolean;
  allowed: boolean;        // can navigate without 403
  loggedIn: boolean;
}

const fetcher = async (url: string): Promise<ArboristApiResponse> => {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) {
    throw new Error(`Failed to fetch Arborist resources: ${res.status}`);
  }
  return res.json();
};

export function useRouteAccess(pathname: string): RouteAccessResult {
  // Just need to know if user is logged in or not
  const { status, pending } = useSession(false); // no redirect side-effects here
  const loggedIn = status === 'issued';

  // If user is not logged in yet, you might choose *not* to fetch,
  // or still fetch to see anonymous/logged-in-group resources.
  const { data, error, isLoading } = useSWR<ArboristApiResponse>(
    '/api/arborist/resources',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 60_000,
      shouldRetryOnError: false,
    },
  );

  if (pending || isLoading || !data) {
    return {
      loading: true,
      error: error as Error | undefined,
      isProtected: false,
      loginRequired: false,
      authzRequired: false,
      allowed: false,
      loggedIn,
    };
  }

  const rule = data.routeConfig[pathname];
  if (!rule) {
    // Not configured: public page
    return {
      loading: false,
      error: error as Error | undefined,
      isProtected: false,
      loginRequired: false,
      authzRequired: false,
      allowed: true,
      loggedIn,
    };
  }

  const loginRequired = rule.loginRequired ?? true;
  const hasAuthzResources =
    Array.isArray(rule.authzResources) && rule.authzResources.length > 0;

  // If login is required and user is not logged in → not allowed
  if (loginRequired && !loggedIn) {
    return {
      loading: false,
      error: error as Error | undefined,
      isProtected: true,
      loginRequired: true,
      authzRequired: hasAuthzResources && !data.disabled,
      allowed: false,
      loggedIn,
    };
  }

  // If authz is globally disabled OR no authzResources, then login-only is enough
  if (data.disabled || !hasAuthzResources) {
    return {
      loading: false,
      error: error as Error | undefined,
      isProtected: true,
      loginRequired,
      authzRequired: false,
      allowed: true,
      loggedIn,
    };
  }

  // Authz enabled and authzResources defined → check membership
  const userResources = data.resources || [];
  const allowed = rule.authzResources!.some((needed) =>
    userResources.includes(needed),
  );

  return {
    loading: false,
    error: error as Error | undefined,
    isProtected: true,
    loginRequired,
    authzRequired: true,
    allowed,
    loggedIn,
  };
}
