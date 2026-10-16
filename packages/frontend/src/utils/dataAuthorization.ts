export interface AuthorizationValues {
  enabled: boolean;
  label?: string;
}

export interface DataAuthorization {
  tooltip?: string;
  supportedValues?: Record<string, AuthorizationValues>;
  isMesh?: boolean;
  enabled?: boolean;
}
