export interface Permission {
  id: number;
  action: {
  service: string;
  method: string;
  };
}

export interface Resource {
  name: string;
  description?: string;
  subresources?: Array<Resource>;
}


export interface Role {
  id: string;
  description?: string;
  permissions: Array<Permission>;
}

export interface Policy {
  id: number;
  description?: string;
  role_ids: Array<string>;
  resource_paths: Array<string>;
}

export interface User {
  id: string;
  admin?: boolean;
  description?: string;
  tags?: {
    email?: string;
    name?: string;
  }
  policies?: Policy[];
  roles?: Role[];
  groups?: Group[];
}

export interface Group {
  name: string;
  policies?: Policy[];
  users?: User[];
}

export interface Authz {
  users: User[];
  groups: Group[];
  roles: Role[];
  policies: Policy[];
  resources: Resource[];
}

export interface UserYaml extends Record<string, any> {
  users: User[];
  authz: {
    groups: Group[];
    roles: Role[];
    policies: Policy[];
    resources: Resource[];
  }
}
