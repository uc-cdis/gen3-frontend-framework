export interface RemoteSupportRequest {
  subject: string;
  fullName: string;
  email: string;
  contents: string;
}

export interface RemoteSupportConfiguration {
  custom_fields?: Record<string, string>[];
  zendeskSubdomainName: string;
  [key:string]: string | Record<string, string>[] | unknown;
};

export type RemoteSupportRequestAction = (
  requestData: RemoteSupportRequest,
  configuration: RemoteSupportConfiguration,
) => Promise<void>;

export class MissingServiceConfigurationError extends Error {
  constructor(serviceName: string) {
    super(`Missing service configuration for ${serviceName}`);
    this.name = 'MissingServiceConfigurationError';
  }
}
