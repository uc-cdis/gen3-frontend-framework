import { useSession } from '../../lib/session/session';
import { useProtectedRoutesContext } from './ProtectedRoutesProvider';
import { useGetAuthzResourcesQuery } from '@gen3/core';

export interface RouteAccessResult {
  loading: boolean;
  error?: Error;
  isProtected: boolean;
  loginRequired: boolean;
  authzRequired: boolean;
  allowed: boolean;
  loggedIn: boolean;
}

export function useRouteAccess(pathname: string): RouteAccessResult {
  // Just need to know if user is logged in or not
  const { status, pending } = useSession(false); // no redirect side-effects here
  const loggedIn = status === 'issued';
  const routesConfig = useProtectedRoutesContext();
  const {
    data,
    error: authzResourceError,
    isFetching: isAuthzResourcesFetching,
  } = useGetAuthzResourcesQuery();

  const error = authzResourceError
    ? Error(
        `Failed to fetch Arborist resources: ${authzResourceError.toString()}`,
      )
    : undefined;

  const rule = routesConfig.routes[pathname] || routesConfig.routes['*'];
  if (!rule) {
    // Not configured: public page
    return {
      loading: false,
      error: undefined,
      isProtected: false,
      loginRequired: false,
      authzRequired: false,
      allowed: true,
      loggedIn,
    };
  }

  const loginRequired = rule.loginRequired ?? true;

  // If a session is loading and the page might require login, we must wait.
  if (pending && loginRequired) {
    return {
      loading: true,
      error: error,
      isProtected: true,
      loginRequired: true,
      authzRequired: false,
      allowed: false,
      loggedIn,
    };
  }

  const hasAuthzResources = Array.isArray(rule.authz) && rule.authz.length > 0;

  // If login is required and user is not logged in → not allowed
  if (loginRequired && !loggedIn) {
    return {
      loading: false,
      error: error as Error | undefined,
      isProtected: true,
      loginRequired: true,
      authzRequired: hasAuthzResources,
      allowed: false,
      loggedIn,
    };
  }

  // If no authzResources, then login-only is enough
  if (!hasAuthzResources) {
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

  // Only check authz fetch status if authz is actually required
  if (isAuthzResourcesFetching || !data) {
    return {
      loading: true,
      error: error,
      isProtected: true,
      loginRequired: true,
      authzRequired: true,
      allowed: false,
      loggedIn,
    };
  }

  // Authz enabled and authzResources defined → check membership
  const userResources = data?.resources || [];
  const allowed = rule.authz!.some((needed: any) =>
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
