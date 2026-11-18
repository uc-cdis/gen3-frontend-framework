export interface ServiceAndMethod {
  method: string;
  service: string;
}

export interface AuthzResourceResponse {
  resources: Array<string>;
}

export interface AuthzResourceData {
  name: string;
  path: string;
  description: string;
  subresources?: string[];
}

export interface CreateAuthzResourceRequest {
  path?: string;
  resourcePath: string;
  data: AuthzResourceData;
}

export interface CreateAuthzResourceResponse {
  created: AuthzResourceData;
}

export type AuthzMapping = Record<string, ServiceAndMethod[]>;

export type ResourceAuthzMapping = Record<string, AuthzMapping>;

export interface AuthzRequest {}

export interface CheckAuthzResourceResponse {
  authorized: boolean;
}

interface AuthzRequestAction {
  resource: string;
  action?: ServiceAndMethod;
}

export interface CheckAuthzRequest {
  request?: AuthzRequestAction;
  requests?: AuthzRequestAction[];
  user?: {
    token: string;
    user_id: string;
  };
}
