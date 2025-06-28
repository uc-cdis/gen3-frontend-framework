export interface AuthorizationValues {
  enabled: boolean;
  menuText: string;
}

export interface DataAuthorization {
  columnTooltip?: string;
  supportedValues?: Record<string, AuthorizationValues>;
  isMesh?: boolean;
  enabled?: boolean;
}
