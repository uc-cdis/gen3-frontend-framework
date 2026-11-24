import ContentSource from './lib/content/index';
import type { AuthorizedRoutesConfig, RouteConfig } from './lib/authz/type';
import { DefaultAuthorizedRoutesConfig } from './lib/authz/type';
import type { RouteAccess } from './lib/authz/routeAuthz';
import {
  checkRuleAccess,
  parseAuthzConfig,
  resolveRoute,
} from './lib/authz/routeAuthz';
import type { AuthzMapping as RouteAuthzMapping } from './lib/authz/hasPermission';
import { fetchJWTKey, getAccessToken } from './lib/auth/utils';
import sessionToken from './api/auth/sessionToken';
import sessionLogout from './api/auth/sessionLogout';
import credentialsLogin from './api/auth/credentialsLogin';
import { default as discoveryMDSProxy } from './lib/Discovery/discoveryMDSProxy';
import { default as vlmdS3UploadProxy } from './lib/VLMDSubmission/vlmdS3UploadProxy';

export {
  type RouteConfig,
  type AuthorizedRoutesConfig,
  type RouteAccess,
  type RouteAuthzMapping,
  parseAuthzConfig,
  resolveRoute,
  checkRuleAccess,
  ContentSource,
  DefaultAuthorizedRoutesConfig,
  fetchJWTKey,
  getAccessToken,
  sessionToken,
  sessionLogout,
  credentialsLogin,
  vlmdS3UploadProxy,
  discoveryMDSProxy,
};
