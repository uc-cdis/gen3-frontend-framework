/**
 * Frontend server side api to extract the frontend-protected resources
 */
import { GEN3_COMMONS_NAME } from '@gen3/core/server';
import { AuthorizedRoutesConfig } from '@gen3/frontend/server';

let cachedConfig: AuthorizedRoutesConfig | null = null;

export function getRouteConfig(): AuthorizedRoutesConfig {
  if (cachedConfig) return cachedConfig;

  const envConfig = process.env.GEN3_PAGE_AUTHZ;
  if (envConfig) {
    try {
      cachedConfig = JSON.parse(envConfig) as AuthorizedRoutesConfig;
      return cachedConfig;
    } catch (e) {
      console.error('Failed to parse GEN3_PAGE_AUTHZ:', e);
    }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedConfig = require(
      `../../../config/${GEN3_COMMONS_NAME}/authz.json`,
    ) as AuthorizedRoutesConfig;
    return cachedConfig;
  } catch (e) {
    console.error(
      `Failed to load ../../../config/${GEN3_COMMONS_NAME}/authz.json, falling back to ./config/authz_default.json:`,
      e,
    );
  }

  return {
    routes: {}
  };

}
