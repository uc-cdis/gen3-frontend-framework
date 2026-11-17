/**
 * An Arborist permission requirement. A bare string is a resource path with
 * service and method defaulting to '*'.
 */
export type AuthzRule = {
  resource: string;
  service?: string; // default '*'
  method?: string; // default '*'
};

export type AuthzEntry = string | AuthzRule;

export type RouteRule = {
  /** Defaults to true for any route that has a rule. */
  loginRequired?: boolean;
  authz?: AuthzEntry[];
  /** How multiple authz entries combine. Defaults to 'any' (existing behaviour). */
  authzMatch?: 'all' | 'any';
  redirect403?: string;
};

export type RouteConfig = Record<string, RouteRule>;

export interface AuthorizedRoutesConfig {
  routes: RouteConfig;
}

export const DefaultAuthorizedRoutesConfig = {
  routes: {
    '/DataLibrary': {
      loginRequired: true,
    },
    '/Workspace': {
      loginRequired: true,
    },
    '/Profile': {
      loginRequired: true,
    },
    '*': {
      loginRequired: false,
    },
  },
};
