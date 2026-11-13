import type { RouteConfig, RouteRule } from './type';

/** Page nginx redirects to when a user is denied access to the workspace proxy. */
export const NO_WORKSPACE_ACCESS_ROUTE = '/no-workspace-access';
/** Route whose rule decides how a workspace denial is handled. */
export const WORKSPACE_ROUTE = '/Workspace';
/** Built-in page rendered (via rewrite) when no redirect403 is configured. */
export const FORBIDDEN_ROUTE = '/403';

export type ForbiddenAction =
  | { type: 'redirect'; destination: string }
  | { type: 'rewrite'; destination: string };

/**
 * Decide how to handle a user who is logged in but not authorized for a route.
 * A configured `redirect403` wins; otherwise the user sees the config-driven 403 page.
 */
export const resolveForbiddenAction = (
  rule?: Pick<RouteRule, 'redirect403'>,
): ForbiddenAction =>
  rule?.redirect403
    ? { type: 'redirect', destination: rule.redirect403 }
    : { type: 'rewrite', destination: FORBIDDEN_ROUTE };

/**
 * Find the rule for a path: exact match, then `/dir/(.*)` style wildcard
 * subdirectory rules, then the `*` fallback.
 */
export const getRouteRuleForPath = (
  pathname: string,
  routeConfig: RouteConfig,
): RouteRule | undefined => {
  const pathParts = pathname.split('/');
  if (pathParts.length > 2) {
    const startsWithPath = `/${pathParts[1]}`;
    const routeConfigMatch = Object.keys(routeConfig).find((key) =>
      key.startsWith(startsWithPath),
    );
    if (routeConfigMatch?.endsWith('(.*)')) {
      return routeConfig[routeConfigMatch];
    }
  }
  return routeConfig[pathname] ?? routeConfig['*'];
};
