import { AggregationsData, GEN3_API } from '@gen3/core';
import { diversityApi } from './appApi';

export interface DiversityRequestParams {
  dataset: string;
}

export const diversityDataApi = diversityApi.injectEndpoints({
  endpoints: (builder) => ({
    getDataset: builder.query<AggregationsData, DiversityRequestParams>({
      query: ({ dataset }: DiversityRequestParams) => {
        return `${GEN3_API}/api/v1/statistics/diversity/${dataset}`;
      },
    }),
  }),
});

export const { useGetDatasetQuery } = diversityDataApi;
