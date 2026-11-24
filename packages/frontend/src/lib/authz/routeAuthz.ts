import type { AccessRule, AuthzMapping } from './hasPermission';
import { hasPermission, isPathPrefixOfPath } from './hasPermission';
import type {
  AuthorizedRoutesConfig,
  AuthzEntry,
  RouteConfig,
  RouteRule,
} from './type';

export type RouteAccess = 'allowed' | 'loginRequired' | 'forbidden';

const WILDCARD_ROUTE_KEY = '*';
// Legacy suffix: "/Docs/(.*)" protects everything under /Docs
const LEGACY_WILDCARD_SUFFIX = '/(.*)';

export const toRule = (entry: AuthzEntry): AccessRule =>
  typeof entry === 'string' ? { resource: entry } : entry;

const routeKeyToPrefix = (key: string): string =>
  key.endsWith(LEGACY_WILDCARD_SUFFIX)
    ? key.slice(0, -LEGACY_WILDCARD_SUFFIX.length)
    : key;

/**
 * Exact match first, then the longest route key that is a path prefix
 * (so /Workspace also protects /Workspace/abc), then '*'.
 */
export const resolveRoute = (
  routes: RouteConfig,
  pathname: string,
): RouteRule | undefined => {
  if (Object.hasOwn(routes, pathname) && pathname !== WILDCARD_ROUTE_KEY) {
    return routes[pathname];
  }
  const prefix = Object.keys(routes)
    .filter(
      (r) =>
        r !== WILDCARD_ROUTE_KEY &&
        isPathPrefixOfPath(routeKeyToPrefix(r), pathname),
    )
    .sort((a, b) => b.length - a.length)[0];
  return (prefix !== undefined && routes[prefix]) || routes[WILDCARD_ROUTE_KEY];
};

/** True when the mapping satisfies the route's authz entries. */
export const satisfiesAuthz = (
  rule: RouteRule,
  mapping: AuthzMapping,
): boolean => {
  const entries = rule.authz ?? [];
  const check = (e: AuthzEntry) => hasPermission(mapping, toRule(e));
  return rule.authzMatch === 'all' ? entries.every(check) : entries.some(check);
};

export const checkRuleAccess = (
  rule: RouteRule | undefined,
  {
    isLoggedIn,
    mapping,
  }: { isLoggedIn: boolean; mapping: AuthzMapping | undefined },
): RouteAccess => {
  if (!rule) return 'allowed'; // not configured: public
  const entries = rule.authz ?? [];
  const loginRequired = rule.loginRequired ?? true;
  if (!loginRequired && entries.length === 0) return 'allowed';
  if (loginRequired && !isLoggedIn) return 'loginRequired';
  if (entries.length === 0) return 'allowed';
  // Arborist can grant anonymous policies, so a mapping may satisfy a
  // route that does not require login.
  if (mapping && satisfiesAuthz(rule, mapping)) return 'allowed';
  return isLoggedIn ? 'forbidden' : 'loginRequired';
};

/** Validate at load so a malformed authz.json fails loudly, not as a silent deny. */
export const parseAuthzConfig = (raw: unknown): AuthorizedRoutesConfig => {
  const fail = (msg: string): never => {
    throw new Error(`Invalid authz.json: ${msg}`);
  };
  if (typeof raw !== 'object' || raw === null || !('routes' in raw))
    fail('missing "routes"');
  const routes = (raw as { routes: unknown }).routes;
  if (typeof routes !== 'object' || routes === null)
    fail('"routes" must be an object');
  for (const [path, cfg] of Object.entries(
    routes as Record<string, Record<string, unknown>>,
  )) {
    if (path !== WILDCARD_ROUTE_KEY && !path.startsWith('/'))
      fail(`route "${path}" must start with "/" or be "*"`);
    if (
      cfg.authzMatch !== undefined &&
      cfg.authzMatch !== 'all' &&
      cfg.authzMatch !== 'any'
    ) {
      fail(`route "${path}": authzMatch must be "all" or "any"`);
    }
    if (cfg.authz !== undefined && !Array.isArray(cfg.authz))
      fail(`route "${path}": authz must be an array`);
    for (const e of (cfg.authz as unknown[] | undefined) ?? []) {
      const resource =
        typeof e === 'string'
          ? e
          : (e as { resource?: unknown } | null)?.resource;
      if (typeof resource !== 'string' || !resource.startsWith('/')) {
        fail(
          `route "${path}": authz resource must be a path starting with "/"`,
        );
      }
      if (typeof e === 'object' && e !== null) {
        for (const k of Object.keys(e)) {
          if (!['resource', 'service', 'method'].includes(k))
            fail(`route "${path}": unknown key "${k}"`);
        }
      }
    }
  }
  return raw as AuthorizedRoutesConfig;
};
