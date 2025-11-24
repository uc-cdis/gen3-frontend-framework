import { GEN3_AUTHZ_API } from '../../constants';
import { AuthzResourceResponse } from './types';

/**
 * Low-level helper to fetch Arborist resources for the current user.
 * Adds an Authorization header when a token is provided and normalizes the response
 * to a simple string[] of resource paths.
 */
export async function fetchArboristResources(
  token: string | null,
): Promise<string[]> {
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${GEN3_AUTHZ_API}/resources`, { headers });

  if (!res.ok) {
    console.error('Arborist /resources failed:', res.status, await res.text());
    return [];
  }

  const data = (await res.json()) as AuthzResourceResponse;
  return data.resources ?? [];
}
