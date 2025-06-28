export interface RemoteSupportRequest {
  subject: string;
  fullName: string;
  email: string;
  contents: string;
}

export type RemoteSupportConfiguration = Record<string, string>;

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
