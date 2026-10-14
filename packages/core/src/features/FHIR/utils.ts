import { GEN3_FHIR_API } from '../../constants';

export type FhirSearchParams = Record<string, string | string[]>;

export interface FhirSearchArgs {
  resource: string;
  params?: FhirSearchParams;
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
): string => {
  const qs = params ? serializeFhirParams(params) : '';
  return `${GEN3_FHIR_API}/${encodeURIComponent(resource)}${qs ? `?${qs}` : ''}`;
};

// gen3Api doesn't set Accept, so a per-request one sticks
export const FHIR_HEADERS = { Accept: 'application/fhir+json' };
