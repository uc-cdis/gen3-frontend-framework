import {
  type AuthzResourceResponse,
  GEN3_AUTHZ_API,
  GEN3_AUTHZ_SERVICE,
} from '@gen3/core/server';

const DEFAULT_TTL_SECONDS = 360;

/**
 * Low-level helper to fetch Arborist resources for the current user.
 * Adds an Authorization header when a token is provided and normalizes the response
 * to a simple string[] of resource paths.
 */
export async function fetchArboristResources(
  token: string | null,
  revalidate: number = DEFAULT_TTL_SECONDS,
): Promise<string[]> {
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(
    `${process.env.NODE_ENV === 'development' ? GEN3_AUTHZ_API : GEN3_AUTHZ_SERVICE}/resources`,
    { headers, next: { revalidate: revalidate } },
  );

  if (!res.ok) {
    console.error('Arborist /resources failed:', res.status, await res.text());
    return [];
  }

  const data = (await res.json()) as AuthzResourceResponse;
  return data.resources ?? [];
}
