import { gen3Api } from '../gen3';
import { GEN3_GUPPY_API } from '../../constants';
import { convertFilterSetToGqlFilter, GQLFilter } from '../filters';
import { BaseGuppyDataRequest, GuppyDownloadDataParams } from './types';

export interface GuppyDownloadDataQueryParams extends BaseGuppyDataRequest {
  filter: GQLFilter;
}

interface DownloadRequestStatus {
  readonly status: string;
  readonly message: string;
}

export const downloadRequestApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    downloadFromGuppy: builder.mutation({
      query: ({
        type,
        filter,
        accessibility,
        fields,
        sort,
      }: GuppyDownloadDataParams) => {
        const queryBody: GuppyDownloadDataQueryParams = {
          filter: convertFilterSetToGqlFilter(filter),
          ...{ type, accessibility, fields, sort },
        };
        return {
          url: `${GEN3_GUPPY_API}/download`,
          method: 'POST',
          queryBody,
          cache: 'no-cache',
        };
      },
      transformResponse: (response: DownloadRequestStatus) => {
        return response;
      },
    }),
  }),
});

export const { useDownloadFromGuppyMutation } = downloadRequestApi;
