/**
 * Frontend server side api to extract the frontend-protected resources
 */
type RouteRule = {
  loginRequired?: boolean;
  authzResources?: string[];
};
export type RouteConfig = Record<string, RouteRule>;

export function getAuthzEnabled(): boolean {
  const isEnabled = process.env.GEN3_ARBORIST_AUTHZ_ENABLED;
  if (!isEnabled) return false; // default OFF
  return isEnabled.toLowerCase() === 'true';
}

let cachedConfig: RouteConfig | null = null;

export function getRouteConfig(): RouteConfig {
  if (cachedConfig) return cachedConfig;

  const envConfig = process.env.GEN3_PAGE_AUTHZ;
  if (envConfig) {
    try {
      cachedConfig = JSON.parse(envConfig) as RouteConfig;
      return cachedConfig;
    } catch (e) {
      console.error('Failed to parse GEN3_PAGE_AUTHZ:', e);
    }
  }

  const commonsName = process.env.NEXT_PUBLIC_GEN3_COMMONS_NAME || 'gen3';

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedConfig = require(
      `../../../config/${commonsName}/authz.json`,
    ) as RouteConfig;
    return cachedConfig;
  } catch (e) {
    console.error(
      `Failed to load ../../../config/${commonsName}/authz.json, falling back to ./config/arborist.pages.json:`,
      e,
    );
  }

  return {};

}
