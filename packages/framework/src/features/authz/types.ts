export interface ServiceAndMethod {
  method: string;
  service: string;
}

export type AuthzMapping = Record<string, ServiceAndMethod[]>;
