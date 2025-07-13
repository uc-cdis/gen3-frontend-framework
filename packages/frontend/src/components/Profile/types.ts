import { Gen3AppConfigData } from '../../lib/content/types';

export interface ServiceColorAndLabel {
  serviceName: string;
  color: string;
  label?: string;
}

export interface ResourceTableConfig {
  title?: string;
  serviceColors?: Record<string, ServiceColorAndLabel>;
}

export interface ProfileConfig extends Gen3AppConfigData {
  resourceTable?: ResourceTableConfig;
  hasExternalLogins?: boolean;
}

export interface APICredentials {
  api_key: string;
  key_id: string;
}
