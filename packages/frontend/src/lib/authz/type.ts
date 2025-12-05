export type RouteRule = {
  loginRequired?: boolean;
  authz?: string[];
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
