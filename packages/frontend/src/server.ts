import ContentSource from './lib/content/index';
import type { AuthorizedRoutesConfig, RouteConfig } from './lib/authz/type';
import { DefaultAuthorizedRoutesConfig } from './lib/authz/type';
import { fetchJWTKey, getAccessToken } from './lib/auth/utils';
import sessionToken from './api/auth/sessionToken';
import sessionLogout from './api/auth/sessionLogout';
import credentialsLogin from './api/auth/credentialsLogin';
import { default as discoveryMDSProxy } from './lib/Discovery/discoveryMDSProxy';
import { default as vlmdS3UploadProxy } from './lib/VLMDSubmission/vlmdS3UploadProxy';

export {
  type RouteConfig,
  type AuthorizedRoutesConfig,
  ContentSource,
  DefaultAuthorizedRoutesConfig,
  fetchJWTKey,
  getAccessToken,
  sessionToken,
  sessionLogout,
  credentialsLogin,
  discoveryMDSProxy,
  vlmdS3UploadProxy,
};
