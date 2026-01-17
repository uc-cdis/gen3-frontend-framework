import { GEN3_SEARCH_API } from '../../constants';
import { gen3Api } from '../gen3';
import { FilterSet } from '../filters';
import { AggregationsData } from '../../types';
import { convertFilterSetToApiFilter } from './filters.ts';
import { processApiHistogramResponse } from './processing.ts';

interface Api32SearchRequestParams {
  index: string;
  filters: FilterSet;
  fields?: Array<string>;
  page?: { limit: number; offset: number };
}

/**
 * returns a response from the AI search service
 * @param searchParams - the parameters for the AI search service
 * @returns the response from the AI search service
 */
export const api32SearchApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    searchAggregations: builder.query<
      AggregationsData,
      Api32SearchRequestParams
    >({
      query: (searchParams: Api32SearchRequestParams) => ({
        url: `${GEN3_SEARCH_API}/${searchParams.index}/counts`,
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: convertFilterSetToApiFilter(searchParams.filters),
          select: searchParams.fields,
        }),
      }),
      transformResponse: (data: Record<string, any>, _) => {
        const buckets = processApiHistogramResponse<AggregationsData>(
          data?.counts ?? {},
        );

        return {
          ...buckets,
        };
      },
    }),
    tableData: builder.query<AggregationsData, Api32SearchRequestParams>({
      query: (searchParams: Api32SearchRequestParams) => ({
        url: `${GEN3_SEARCH_API}/${searchParams.index}/counts`,
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: convertFilterSetToApiFilter(searchParams.filters),
          page: searchParams.page,
          select: searchParams.fields,
        }),
      }),
    }),
  }),
});

// Add more endpoints here

export const { useSearchAggregationsQuery, useTableDataQuery } = api32SearchApi;
