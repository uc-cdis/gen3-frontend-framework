import { gen3Api } from '../gen3';
import { GEN3_API } from '../../constants';
import { FilterSet } from '../filters/types';
import { Accessibility } from '../../constants';
import { convertFilterSetToGqlFilter, GQLFilter } from '../filters';

interface DownloadRequestStatus {
  readonly status: string;
  readonly message: string;
}

interface BaseDownloadRequest {
  type: string;
  accessibility?: Accessibility;
  fields?: string[];
  sort?: string[];
  format?: string;
}

interface DownloadQueryParams extends BaseDownloadRequest {
  filters: FilterSet;
}

interface DownloadRequestParams extends BaseDownloadRequest {
  readonly filter: GQLFilter;
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
      }: DownloadQueryParams) => {
        const queryBody: DownloadRequestParams = {
          filter: convertFilterSetToGqlFilter(filters),
          ...{ type, accessibility, fields, sort },
        };
        return {
          url: `${GEN3_API}/guppy/download`,
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
