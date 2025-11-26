export type RouteRule = {
  loginRequired?: boolean;
  authzResources?: string[];
};

export type RouteConfig = Record<string, RouteRule>;

export interface AuthorizedRoutesConfig {
  routes: RouteConfig;
  enableAuthz?: boolean;
}
