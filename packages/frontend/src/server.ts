import { getNavPageLayoutPropsFromConfig } from './lib/common/staticProps';
import ContentSource from './lib/content/index';
import type { QueryPageLayoutProps, QueryProps } from './pages/Query';
import type { AuthorizedRoutesConfig, RouteConfig } from './lib/authz/type';
import { DefaultAuthorizedRoutesConfig } from './lib/authz/type';
import { fetchJWTKey } from './lib/auth/utils';

import sessionToken from './api/auth/sessionToken';

export {
  type QueryProps,
  type QueryPageLayoutProps,
  type RouteConfig,
  type AuthorizedRoutesConfig,
  ContentSource,
  DefaultAuthorizedRoutesConfig,
  getNavPageLayoutPropsFromConfig,
  sessionToken,
  fetchJWTKey,
};
