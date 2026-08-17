import { gen3Api } from '../gen3';
import { GEN3_GUPPY_API } from '../../constants';
import { convertFilterSetToGqlFilter, GQLFilter } from '../filters';
import { GuppyDownloadDataParams, GuppyDownloadDataRequest } from './types';
import { JSONObject } from '../../types';

export interface GuppyDownloadDataQueryParams extends Omit<
  GuppyDownloadDataRequest,
  'filter'
> {
  filter: GQLFilter;
}

interface DownloadRequestStatus {
  readonly status: string;
  readonly message: string;
}

export interface GuppyStatusResponse {
  readonly status: string;
  readonly timestamp: string;
  readonly statusCode: string;
}

/**
 * Creates a Guppy API for fetching bulk (> 10K rows) elasticsearch data
 * @see https://github.com/uc-cdis/guppy/blob/master/doc/download.md
 * @param endpoints - Resolver function which configures the query with
 * type, filter, accessibility, fields, and sort arguments
 * @returns: A guppy download API for fetching bulk metadata
 */
export const guppyDownloadApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    downloadFromGuppy: builder.query({
      query: ({
        type,
        filter,
        accessibility,
        fields,
        sort,
      }: GuppyDownloadDataParams) => {
        const queryBody: GuppyDownloadDataQueryParams = {
          filter: convertFilterSetToGqlFilter(filter),
          type,
          accessibility,
          fields,
          sort,
        };

        return {
          url: `${GEN3_GUPPY_API}/download`,
          method: 'POST',
          body: queryBody,
          cache: 'no-cache',
        };
      },
      transformResponse: (response: DownloadRequestStatus) => {
        return response;
      },
    }),
    guppyServiceStatus: builder.query<GuppyStatusResponse, void>({
      query: () => {
        return {
          url: `${GEN3_GUPPY_API}/_status`,
        };
      },
      transformResponse: (data: JSONObject) => {
        return {
          status: data?.status?.toString() ?? 'error',
          timestamp: new Date().toLocaleTimeString(),
          statusCode: data?.statusCode?.toString() ?? 'error',
        };
      },
    }),
  }),
});

export const {
  useDownloadFromGuppyQuery,
  useLazyDownloadFromGuppyQuery,
  useLazyGuppyServiceStatusQuery,
} = guppyDownloadApi;
