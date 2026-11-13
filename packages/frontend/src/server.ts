import ContentSource from './lib/content/index';
import type {
  AuthorizedRoutesConfig,
  RouteConfig,
  RouteRule,
} from './lib/authz/type';
import { DefaultAuthorizedRoutesConfig } from './lib/authz/type';
import type { ForbiddenAction } from './lib/authz/forbidden';
import {
  FORBIDDEN_ROUTE,
  getRouteRuleForPath,
  NO_WORKSPACE_ACCESS_ROUTE,
  resolveForbiddenAction,
  WORKSPACE_ROUTE,
} from './lib/authz/forbidden';
import { fetchJWTKey, getAccessToken } from './lib/auth/utils';
import sessionToken from './api/auth/sessionToken';
import sessionLogout from './api/auth/sessionLogout';
import credentialsLogin from './api/auth/credentialsLogin';
import { default as discoveryMDSProxy } from './lib/Discovery/discoveryMDSProxy';
import { default as vlmdS3UploadProxy } from './lib/VLMDSubmission/vlmdS3UploadProxy';

export {
  type RouteConfig,
  type RouteRule,
  type AuthorizedRoutesConfig,
  type ForbiddenAction,
  FORBIDDEN_ROUTE,
  NO_WORKSPACE_ACCESS_ROUTE,
  WORKSPACE_ROUTE,
  getRouteRuleForPath,
  resolveForbiddenAction,
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
