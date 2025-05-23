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
