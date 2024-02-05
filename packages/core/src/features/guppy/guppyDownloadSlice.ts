import { gen3Api } from '../gen3';
import { GEN3_GUPPY_API } from '../../constants';
import { convertFilterSetToGqlFilter } from '../filters';
import { GuppyDownloadQueryParams, GuppyDownloadRequestParams } from './types';

interface DownloadRequestStatus {
  readonly status: string;
  readonly message: string;
}

export const downloadRequestApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    downloadFromGuppy: builder.query({
      query: ({
        type,
        filters,
        accessibility,
        fields,
        sort,
      }: GuppyDownloadQueryParams) => {
        const queryBody: GuppyDownloadRequestParams = {
          filter: convertFilterSetToGqlFilter(filters),
          ...{ type, accessibility, fields, sort },
        };
        return {
          url: `${GEN3_GUPPY_API}/download`,
          method: 'POST',
          queryBody,
        };
      },
      transformResponse: (response: DownloadRequestStatus) => {
        return response;
      },
    }),
  }),
});

export const { useDownloadFromGuppyQuery } = downloadRequestApi;
