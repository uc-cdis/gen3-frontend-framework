import { AuthorizedRoutesConfig } from '../../lib/authz/type';
import { LinkAuthStatus } from './types';

export const extractClassName = (
  key: string,
  classNames: Record<string, string>,
): string => {
  if (typeof classNames === 'object' && key in classNames) {
    return classNames[key];
  }
  return '';
};
export const checkRouteAccess = (
  pathname: string,
  resources: string[],
  routesConfig: AuthorizedRoutesConfig,
  loggedIn: boolean,
  pending: boolean,
): LinkAuthStatus => {
  const rule = routesConfig.routes[pathname] || routesConfig.routes['*'];
  if (!rule) {
    // Not configured: public page
    return LinkAuthStatus.Authorized;
  }

  const loginRequired = rule.loginRequired ?? true;

  // If a session is loading and the page might require login, we must wait.
  if (pending && loginRequired) {
    return LinkAuthStatus.LoginRequired;
  }

  const hasAuthzResources = Array.isArray(rule.authz) && rule.authz.length > 0;

  // If login is required and user is not logged in → not allowed
  if (loginRequired && !loggedIn) {
    return LinkAuthStatus.LoginRequired;
  }

  // If no authzResources, then login-only is enough
  if (!hasAuthzResources) {
    return LinkAuthStatus.Authorized;
  }

  // Only check authz fetch status if authz is actually required
  if (pending) {
    return LinkAuthStatus.Pending;
  }

  // Authz enabled and authzResources defined → check membership
  const allowed = rule.authz!.some((needed: any) => resources.includes(needed));

  if (allowed) {
    return LinkAuthStatus.Authorized;
  } else {
    return LinkAuthStatus.Unauthorized;
  }
};
