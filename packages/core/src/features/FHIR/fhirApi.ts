import { gen3Api } from '../gen3';
import { GEN3_FHIR_API } from '../../constants';
import { parseCapability } from './capability';
import type { Bundle, FhirResource, ResourceDef } from './types';
import {
  FHIR_HEADERS,
  fhirSearchUrl,
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
    }),
    searchFhirResource: builder.query<Bundle, FhirSearchArgs>({
      query: ({ resource, params }) => ({
        url: fhirSearchUrl(resource, params),
        headers: FHIR_HEADERS,
      }),
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
