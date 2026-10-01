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

  // If no authzResources, then login-only is enough
  if (!loginRequired) {
    return LinkAuthStatus.Authorized;
  }

  const hasAuthzResources = Array.isArray(rule.authz) && rule.authz.length > 0;

  // While the session is still resolving we don't know yet whether the user is
  // logged in, so report pending rather than flashing "login required".
  if (pending && !loggedIn) {
    return LinkAuthStatus.Pending;
  }

  // If login is required and user is not logged in → not allowed
  if (!loggedIn) {
    return LinkAuthStatus.LoginRequired;
  }

  // If no authzResources, then login-only is enough
  if (!hasAuthzResources) {
    return LinkAuthStatus.Authorized;
  }

  // logged in, but the user's authz resources are still being fetched
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
