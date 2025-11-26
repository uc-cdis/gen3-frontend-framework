import { useSession } from '../../lib/session/session';
import { RouteConfig } from '../../lib/authz/type';
import { useProtectedRoutesContext } from './ProtectedRoutesProvider';
import { useGetAuthzResourcesQuery } from '@gen3/core';

interface ArboristApiResponse {
  disabled: boolean;
  resources: string[];
  routeConfig: RouteConfig;
}

export interface RouteAccessResult {
  loading: boolean;
  error?: Error;
  isProtected: boolean;
  loginRequired: boolean;
  authzRequired: boolean;
  allowed: boolean;
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
  const routesConfig =useProtectedRoutesContext();
  const { data, error: authzResourceError, isFetching: isAuthzResourcesFetching, isError: isAuthzResourcesError } = useGetAuthzResourcesQuery();

  console.log("useRouteAccess: ", routesConfig, pathname, loggedIn, data, authzResourceError, isAuthzResourcesFetching, isAuthzResourcesError);

  const error =authzResourceError ? Error(`Failed to fetch Arborist resources: ${authzResourceError.toString()}`) : undefined;
  if (pending || isAuthzResourcesFetching || !data) {
    return {
      loading: true,
      error: error,
      isProtected: false,
      loginRequired: false,
      authzRequired: false,
      allowed: false,
      loggedIn,
    };
  }

  const rule = routesConfig.routes[pathname];
  if (!rule) {
    // Not configured: public page
    return {
      loading: false,
      error: error,
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

  const authzRequired = hasAuthzResources && routesConfig?.enableAuthz !== undefined && routesConfig.enableAuthz;

  console.log("useRouteAccess: ", pathname, loginRequired, hasAuthzResources, authzRequired, loggedIn);

  // If login is required and user is not logged in → not allowed
  if (loginRequired && !loggedIn) {
    return {
      loading: false,
      error: error as Error | undefined,
      isProtected: true,
      loginRequired: true,
      authzRequired: authzRequired,
      allowed: false,
      loggedIn,
    };
  }

  // If authz is globally disabled OR no authzResources, then login-only is enough
  if (authzRequired || !hasAuthzResources) {
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
  const userResources = data?.resources || [];
  const allowed = rule.authzResources!.some((needed: any) =>
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

export type UseRouteAccessHook = typeof useRouteAccess;
