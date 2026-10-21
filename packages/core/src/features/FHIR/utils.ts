import type { FetchBaseQueryMeta } from '@reduxjs/toolkit/query';
import { GEN3_FHIR_API } from '../../constants';
import type { Bundle, FhirSearchResponse } from './types';

export type FhirSearchParams = Record<string, string | string[]>;

export interface FhirSearchArgs {
  resource: string;
  params?: FhirSearchParams;
  // A later page: the query string of the server's `next` link. It already
  // carries the params, and is sent exactly as given.
  page?: string;
}

export interface FhirReadArgs {
  resource: string;
  id: string;
}

/**
 * FHIR reads repeated keys as AND (given=a&given=b) and commas as OR
 * (given=a,b). RTK's default serializer joins arrays with commas, so we build
 * the query string ourselves rather than touch gen3Api's, which every service
 * shares.
 * https://hl7.org/fhir/R4/search.html#combining
 */
export const serializeFhirParams = (params: FhirSearchParams): string =>
  Object.entries(params)
    .flatMap(([key, value]) =>
      (Array.isArray(value) ? value : [value]).map(
        (v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`,
      ),
    )
    .join('&');

// Shared with the UI's URL preview so it always matches the real request
export const fhirSearchUrl = (
  resource: string,
  params?: FhirSearchParams,
  page?: string,
): string => {
  const path = `${GEN3_FHIR_API}/${encodeURIComponent(resource)}`;
  if (page) return `${path}${page}`;
  const qs = params ? serializeFhirParams(params) : '';
  return `${path}${qs ? `?${qs}` : ''}`;
};

// The next link's query string, untouched: re-encoding would break _page_token,
// and the link's own host and trailing slash don't work from here
export const nextPageOf = (bundle: Bundle): string | undefined => {
  const next = bundle.link?.find((link) => link.relation === 'next');
  if (!next) return undefined;
  try {
    // The base only matters if a link is relative
    return new URL(next.url, 'http://localhost').search || undefined;
  } catch {
    // A malformed link means no next page
    return undefined;
  }
};

// gen3Api never sets Accept, so this one isn't overwritten
export const FHIR_HEADERS = { Accept: 'application/fhir+json' };

export const toSearchResponse = (
  bundle: Bundle,
  meta?: FetchBaseQueryMeta,
): FhirSearchResponse => ({ bundle, status: meta?.response?.status });
