import { AggregationsData, GEN3_API } from '@gen3/core';
import { cohortSimilarityApi } from './appApi';

export interface SimilarityRequestParams {
  dataset: string;
}

export const similarityDataApi = cohortSimilarityApi.injectEndpoints({
  endpoints: (builder) => ({
    getDataset: builder.query<AggregationsData, SimilarityRequestParams>({
      query: ({ dataset }: SimilarityRequestParams) => {
        return `${GEN3_API}/api/v1/statistics/similarity/${dataset}`;
      },
    }),
  }),
});

export const { useGetDatasetQuery } = similarityDataApi;
