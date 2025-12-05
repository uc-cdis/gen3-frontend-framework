import { GEN3_AUTHZ_API, GEN3_AUTHZ_SERVICE } from '../../constants';
import { AuthzResourceResponse } from './types';

/**
 * Low-level helper to fetch Arborist resources for the current user.
 * Adds an Authorization header when a token is provided and normalizes the response
 * to a simple string[] of resource paths.
 *
 * token { string | null } - access token to use for authorization
 * useService { boolean } - use the arborist service endpoint instead of the public arborist API
 */
export async function fetchArboristResources(
  token: string | null,
  useService: boolean = false,
): Promise<string[]> {
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(
    `${useService ? GEN3_AUTHZ_SERVICE : GEN3_AUTHZ_API}/resource`,
    { headers },
  );

  if (!res.ok) {
    console.error(
      '@gen3/core:fetchArboristResources /resource failed:',
      res.status,
      await res.text(),
    );
    return [];
  }

  const data = (await res.json()) as AuthzResourceResponse;
  return data.resources ?? [];
}
