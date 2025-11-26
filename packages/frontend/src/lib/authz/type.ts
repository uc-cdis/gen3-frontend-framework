export type RouteRule = {
  loginRequired?: boolean;
  authzResources?: string[];
};

export type RouteConfig = Record<string, RouteRule>;

export interface AuthorizedRoutesConfig {
  routes: RouteConfig;
  enableAuthz?: boolean;
}

export const DefaultAuthorizedRoutesConfig = {
  "enableAuthz" : true,
  "routes": {
    "/DataLibrary": {
      "loginRequired": true
    },
    "/Workspace": {
      "loginRequired": true,
    },
    "/Profile": {
      "loginRequired": true
    },
    "/Login": {
      "loginRequired": false
    },
    "*" : {
      "loginRequired": false
    }
  }
};
