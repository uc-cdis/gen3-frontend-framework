import { AggregationsData, GEN3_API } from '@gen3/core';
import { cohortDistanceApi } from './appApi';

export interface DistanceRequestParams {
  dataset: string;
}

export const distanceDataApi = cohortDistanceApi.injectEndpoints({
  endpoints: (builder) => ({
    getDataset: builder.query<AggregationsData, DistanceRequestParams>({
      query: ({ dataset }: DistanceRequestParams) => {
        return `${GEN3_API}/api/v1/statistics/distance/${dataset}`;
      },
    }),
  }),
});

export const { useGetDatasetQuery } = distanceDataApi;
