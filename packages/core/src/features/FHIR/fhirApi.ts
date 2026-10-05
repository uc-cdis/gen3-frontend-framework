import { gen3Api } from '../gen3';
import { GEN3_FHIR_API } from '../../constants';
import { parseCapability } from './capability';
import type { Bundle, FhirResource, ResourceDef } from './types';

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

// gen3Api doesn't set Accept, so a per-request one sticks
const FHIR_HEADERS = { Accept: 'application/fhir+json' };

/**
 * FHIR proxy endpoints, added to the shared gen3Api.
 */
export const fhirApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getFhirCapability: builder.query<ResourceDef[], void>({
      query: () => ({
        url: `${GEN3_FHIR_API}/metadata`,
        headers: FHIR_HEADERS,
      }),
      transformResponse: parseCapability,
    }),
    searchFhirResource: builder.query<Bundle, FhirSearchArgs>({
      query: ({ resource, params }) => {
        const qs = params ? serializeFhirParams(params) : '';
        return {
          url: `${GEN3_FHIR_API}/${encodeURIComponent(resource)}${qs ? `?${qs}` : ''}`,
          headers: FHIR_HEADERS,
        };
      },
    }),
    readFhirResource: builder.query<FhirResource, FhirReadArgs>({
      query: ({ resource, id }) => ({
        url: `${GEN3_FHIR_API}/${encodeURIComponent(resource)}/${encodeURIComponent(id)}`,
        headers: FHIR_HEADERS,
      }),
    }),
  }),
});

export const {
  useGetFhirCapabilityQuery,
  useSearchFhirResourceQuery,
  useLazySearchFhirResourceQuery,
  useReadFhirResourceQuery,
  useLazyReadFhirResourceQuery,
} = fhirApi;
