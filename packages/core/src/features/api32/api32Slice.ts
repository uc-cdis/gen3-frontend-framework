import { Accessibility, GEN3_SEARCH_API } from '../../constants';
import { gen3Api } from '../gen3';
import { FilterSet } from '../filters';
import { AggregationsData, JSONObject } from '../../types';
import { convertFilterSetToApiFilter } from './filters.ts';
import { processApiHistogramResponse } from './processing.ts';

interface Api32SearchRequestParams {
  index: string;
  filters: FilterSet;
  fields?: Array<string>;
  page?: { limit: number; offset: number };
}

interface Api32TableRequestParams {
  type: string;
  filters: FilterSet;
  fields: Array<string>;
  sort?: ReadonlyArray<Record<string, 'asc' | 'desc'>>;
  offset?: number;
  size?: number;
  format?: string;
  accessibility?: Accessibility;
  indexPrefix?: string;
  filterName?: string;
}

interface Api32CountsResponse {
  count: number;
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
      transformResponse: (data: Record<string, any>) => {
        const buckets = processApiHistogramResponse(data?.counts ?? {});

        return {
          ...buckets,
        };
      },
    }),
    tableData: builder.query<JSONObject, Api32TableRequestParams>({
      query: (args: Api32TableRequestParams) => ({
        url: `${GEN3_SEARCH_API}/${args.type}/query`,
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: convertFilterSetToApiFilter(args.filters),
          select: args.fields,
          page: { limit: args.size, offset: args.offset },
        }),
      }),
      transformResponse: (data: Record<string, any>, _, args) => {
        return {
          data: { [args.type]: data.rows },
        };
      },
    }),
    api32Counts: builder.query<Api32CountsResponse, Api32SearchRequestParams>({
      query: (args: Api32SearchRequestParams) => ({
        url: `${GEN3_SEARCH_API}/${args.index}/query`,
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: convertFilterSetToApiFilter(args.filters),
          select: args.fields,
          page: { limit: 1, offset: 0 },
        }),
      }),
      transformResponse: (data: Record<string, any>) => {
        return {
          count: data?.total ?? 0,
        };
      },
    }),
  }),
});

export const {
  useSearchAggregationsQuery,
  useTableDataQuery,
  useApi32CountsQuery,
} = api32SearchApi;
