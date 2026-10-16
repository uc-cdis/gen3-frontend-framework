import { gen3Api } from '../gen3';
import { GEN3_FHIR_API } from '../../constants';
import { parseCapability } from './capability';
import type { FhirResource, FhirSearchResponse, ResourceDef } from './types';
import {
  FHIR_HEADERS,
  fhirSearchUrl,
  toSearchResponse,
  type FhirReadArgs,
  type FhirSearchArgs,
} from './utils';

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
      // It rarely changes and it's a big download, so keep it an hour after
      // the page stops using it.
      keepUnusedDataFor: 3600,
    }),
    searchFhirResource: builder.query<FhirSearchResponse, FhirSearchArgs>({
      query: ({ resource, params, page }) => ({
        url: fhirSearchUrl(resource, params, page),
        headers: FHIR_HEADERS,
      }),
      transformResponse: toSearchResponse,
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
