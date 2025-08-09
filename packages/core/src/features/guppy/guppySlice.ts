import useSWR, { Fetcher, SWRResponse } from 'swr';
import { AggregationsData, JSONObject, StatsData } from '../../types';
import { Accessibility, GEN3_GUPPY_API } from '../../constants';
import {
  convertFilterSetToGqlFilter,
  FilterSet,
  isFilterEmpty,
} from '../filters';
import { guppyApi, guppyApiSliceRequest } from './guppyApi';
import { SharedFieldMapping } from './types';

import { groupSharedFields } from './utils';
import { processHistogramResponse } from './processing';
import {
  histogramQueryStrForEachField,
  nestedHistogramQueryStrForEachField,
  rawDataQueryStrForEachField,
  statsQueryStrForEachField,
} from './queryGenerators';

const statusEndpoint = '/_status';

export interface GraphQLQuery {
  query: string;
  variables?: Record<string, unknown>;
}

export const fetchJson: Fetcher<JSONObject, string> = async (url: string) => {
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-type': 'application/json' },
  });
  if (!res.ok) throw new Error('An error occurred while fetching the data.');
  return (await res.json()) as JSONObject;
};

export const useGetStatus = (): SWRResponse<JSONObject, Error> => {
  const fetcher = () => fetchJson(`${GEN3_GUPPY_API}${statusEndpoint}`);
  return useSWR('explorerStatus', fetcher);
};

export type AggregationResponse = Record<string, JSONObject>;

export interface RawDataAndTotalCountsParams {
  type: string;
  fields: string[];
  filters: FilterSet;
  sort?: ReadonlyArray<Record<string, 'asc' | 'desc'>>;
  offset?: number;
  size?: number;
  accessibility?: Accessibility;
  format?: string;
}

/*
  returns all the fields for a given type
  @param type: the type to get fields for
  @returns: a list of fields for the given type
 */

interface GuppyBaseQueryParams {
  type: string;
  filters: FilterSet;
  accessibility?: Accessibility;
}

interface AccessibleDataSliceParams {
  type: string;
  fields: ReadonlyArray<string>;
  accessibility: Accessibility;
}

interface QueryAggsParams extends GuppyBaseQueryParams {
  fields: ReadonlyArray<string>;
  filterSelf?: boolean;
  queryId?: string;
}

interface QueryForSubAggsParams extends Omit<GuppyBaseQueryParams, 'filters'> {
  mainField: string;
  numericAggAsText: boolean;
  termsFields?: ReadonlyArray<string>;
  missingFields?: ReadonlyArray<string>;
  filters?: FilterSet;
}

interface QueryCountsParams extends GuppyBaseQueryParams {
  queryId?: string;
}

interface QueryForFileCountSummaryParams extends GuppyBaseQueryParams {
  field: string;
}

export const explorerTags = guppyApi.enhanceEndpoints({
  addTagTypes: ['AGGS', 'COUNTS', 'STATS', 'TABLE_DATA', 'RAW_DATA'] as const,
});

/**
 * The main endpoint used in templating Exploration page queries.
 * Includes table, filter and aggregation query types and leverages guppyApi defined in ./gupplApi.ts
 * Query templates support filters where applicable
 *
 * @param endpoints - Defines endpoints used in Exploration page:
 * @param getAllFieldsForType - A mapping query that returns all property key names vertex types specified.
 *   @see https://github.com/uc-cdis/guppy/blob/master/doc/queries.md#mapping-query
 * @param getAccessibleData - An aggregation histogram counts query that filters based on access type
 *   @see https://github.com/uc-cdis/guppy/blob/master/doc/queries.md#accessibility-argument-for-regular-tier-access-level
 * @param getRawDataAndTotalCounts - Queries both _totalCount for selected vertex types and
 * tabular results containing the raw data in the rows of selected vertex types
 *   @see https://github.com/uc-cdis/guppy/blob/master/doc/queries.md#1-total-count-aggregation
 * @param getAggs - An aggregated histogram counts query which outputs vertex property frequencies
 * @param getSubAggs - TODO: not sure what this one does. Looks like nested aggregation
 * @param getCounts - Returns total counts of a vertex type
 * @returns: A guppy API endpoint for templating queryable data displayed on the exploration page
 */
export const explorerApi = explorerTags.injectEndpoints({
  endpoints: (builder) => ({
    getAllFieldsForType: builder.query({
      query: (type: { type: string }) => ({
        query: `{ _mapping ${type} } }`,
      }),
      transformResponse: (response: Record<string, any>, _meta, params) => {
        return response[params.type];
      },
    }),
    getAccessibleData: builder.query({
      query: ({ type, fields, accessibility }: AccessibleDataSliceParams) => {
        const fieldParts = fields.map(
          (field) => `${field} { histogram { key count } }`,
        );
        return {
          query: `_aggregation {
              ${type} (accessibility: ${accessibility}) {
                ${fieldParts.join(',')}
              }
            }`,
        };
      },
    }),
    getRawDataAndTotalCounts: builder.query({
      query: ({
        type,
        fields,
        filters,
        sort,
        offset = 0,
        size = 20,
        accessibility = Accessibility.ALL,
        format = undefined,
      }: RawDataAndTotalCountsParams) => {
        const gqlFilter = convertFilterSetToGqlFilter(filters);
        const params = [
          ...(sort ? ['$sort: JSON'] : []),
          ...(gqlFilter ? ['$filter: JSON'] : []),
          ...(format ? ['$format: Format'] : []),
        ].join(',');
        const queryLine = `query getRawDataAndTotalCounts (${params}) {`;

        const dataParams = [
          ...(format ? ['format: $format'] : []),
          ...(sort ? ['sort: $sort'] : []),
          ...(gqlFilter ? ['filter: $filter'] : []),
        ].join(',');
        const dataTypeLine = `${type} (accessibility: ${accessibility}, offset: ${offset}, first: ${size},
        ${dataParams}) {`;

        const typeAggsLine = `${type} (${
          gqlFilter && 'filter: $filter,'
        } accessibility: ${accessibility}) {`;

        const processedFields = fields.map((field) =>
          rawDataQueryStrForEachField(field),
        );

        const query = `${queryLine}
    ${dataTypeLine}
      ${processedFields.join(' ')}
            }
            _aggregation {
              ${typeAggsLine}
                _totalCount
              }
            }
        }`;
        const variables = {
          ...(sort && { sort }),
          ...(gqlFilter && { filter: gqlFilter }),
          ...(format && { format }),
        };
        return { query, variables };
      },
      providesTags: ['RAW_DATA', 'TABLE_DATA'],
    }),
    getAggs: builder.query<AggregationsData, QueryAggsParams>({
      query: ({
        type,
        fields,
        filters,
        accessibility = Accessibility.ALL,
        filterSelf = false,
      }: QueryAggsParams) => {
        return buildGetAggregationQuery(
          type,
          fields,
          filters,
          accessibility,
          filterSelf,
        );
      },
      transformResponse: (response: Record<string, any>, _meta, args) => {
        const buckets = processHistogramResponse<AggregationsData>(
          response?.data?._aggregation[args.type] ?? {},
        );

        // check for totals
        const count =
          response?.data?._aggregation[args.type]?._totalCount ?? null;

        return {
          _totalCount: [{ key: args.type, count }], // add total count to allow cohorts to cache index item totals
          ...buckets,
        };
      },
      providesTags: ['AGGS'],
    }),
    getStatsAggregations: builder.query<StatsData, QueryAggsParams>({
      query: ({
        type,
        fields,
        filters,
        accessibility = Accessibility.ALL,
        filterSelf = false,
        queryId = undefined,
      }: QueryAggsParams) => {
        return buildGetStatsAggregationQuery(
          type,
          fields,
          filters,
          accessibility,
          filterSelf,
          queryId,
        );
      },
      transformResponse: (response: Record<string, any>, _meta, args) => {
        return processHistogramResponse<StatsData>(
          response?.data?._aggregation[args.type] ?? {},
        );
      },
      providesTags: ['STATS'],
    }),
    getSubAggs: builder.query<AggregationsData, QueryForSubAggsParams>({
      query: ({
        type,
        mainField,
        termsFields = undefined,
        missingFields = undefined,
        numericAggAsText = false,
        filters = undefined,
        accessibility = Accessibility.ALL,
      }: QueryForSubAggsParams) => {
        const nestedAggFields = {
          termsFields: termsFields,
          missingFields: missingFields,
        };

        const query = `query getSubAggs ( ${
          filters ?? '$filter: JSON,'
        } $nestedAggFields: JSON) {
    _aggregation {
      ${type} ( ${
        filters ?? 'filter: $filter, filterSelf: false,'
      } nestedAggFields: $nestedAggFields, accessibility: ${accessibility}) {
      _totalCounts
        ${nestedHistogramQueryStrForEachField(mainField, numericAggAsText)}
      }`;

        return {
          query: query,
          variables: {
            ...(filters && {
              filter: convertFilterSetToGqlFilter(filters),
            }),
            nestedAggFields: nestedAggFields,
          },
        };
      },
      transformResponse: (response: Record<string, any>, _meta, args) => {
        return processHistogramResponse<AggregationsData>(
          response?.data?._aggregation[args.type] ?? {},
        );
      },
      providesTags: ['AGGS'],
    }),

    getCounts: builder.query<number, QueryCountsParams>({
      query: ({
        type,
        filters,
        accessibility = Accessibility.ALL,
        queryId = undefined,
      }: QueryCountsParams) => {
        const gqlFilters = convertFilterSetToGqlFilter(filters);
        const queryLine = `query totalCounts${queryId ? `_${queryId}` : ''} ${
          gqlFilters ? '($filter: JSON)' : ''
        }{`;
        const typeAggsLine = `${type} ${
          gqlFilters ? '(filter: $filter, ' : '('
        } accessibility: ${accessibility}) {`;

        const query = `${queryLine} _aggregation {
          ${typeAggsLine}
            _totalCount
            }
           }
        }`;
        return {
          query: query,
          variables: {
            ...(gqlFilters && {
              filter: gqlFilters,
            }),
          },
        };
      },
      transformResponse: (
        response: Record<string, any>,
        _meta,
        args,
      ): number => {
        if (!response.data || !response.data._aggregation) {
          throw new Error(
            'Invalid response: Missing data or _aggregation field',
          );
        }

        if (!(args.type in response.data._aggregation)) {
          throw new Error(
            `Invalid response: Missing expected key '${args.type}' in _aggregation`,
          );
        }
        return response.data._aggregation[args.type]._totalCount ?? 0;
      },
      providesTags: ['COUNTS'],
    }),
    getFieldCountSummary: builder.query<
      Record<string, any>,
      QueryForFileCountSummaryParams
    >({
      query: ({
        type,
        field,
        filters,
        accessibility = Accessibility.ALL,
      }: QueryForFileCountSummaryParams) => {
        const gqlFilters = convertFilterSetToGqlFilter(filters);
        const query = `query summary ($filter: JSON) {
        _aggregation {
          ${type} (filter: $filter, accessibility: ${accessibility}) {
            ${field} {
              histogram {
                sum,
              }
            }
          }
        }
      }`;
        return {
          query: query,
          variables: {
            ...(gqlFilters && {
              filter: gqlFilters,
            }),
          },
        };
      },
    }),
    getFieldsForIndex: builder.query({
      query: (index: string) => {
        return {
          query: `{
            _mapping { ${index} }
          }`,
        };
      },
      transformResponse: (response: Record<string, any>) => {
        return response['_mapping'];
      },
    }),
    getSharedFieldsForIndex: builder.query<SharedFieldMapping, string[]>({
      query: (indices: string[]) => {
        return {
          query: `{
            _mapping { ${indices.join(' ')} }
          }`,
        };
      },
      transformResponse: (response: Record<string, any>) => {
        if ('_mapping' in response.data) {
          return groupSharedFields(response.data['_mapping']);
        }
        return {};
      },
    }),
    generalGQL: builder.query<Record<string, unknown>, guppyApiSliceRequest>({
      query: ({ query, variables }) => {
        return {
          query: query,
          variables: variables,
        };
      },
    }),
  }),
});

export const useGetArrayTypes = () => {
  {
    const { data, error } = useGetStatus();
    if (error) {
      return {};
    }
    return data ? data['indices'] : {};
  }
};

export const useGetIndexFields = (index: string) => {
  const { data } = useGetFieldsForIndexQuery(index);
  return data ?? [];
};

export const buildGetAggregationQuery = (
  type: string,
  fields: ReadonlyArray<string>,
  filters: FilterSet,
  accessibility = Accessibility.ALL,
  filterSelf: boolean = false,
  queryId: string | undefined = undefined,
): GraphQLQuery => {
  const queryStart = isFilterEmpty(filters)
    ? `
              query getAggs${queryId ? `_${queryId}` : ''} {
              _aggregation {
              ${type} (accessibility: ${accessibility}) {`
    : `query getAggs ($filter: JSON) {
               _aggregation {

                      ${type} (filter: $filter, filterSelf: ${filterSelf ? 'true' : 'false'}, accessibility: ${accessibility}) { _totalCount`;
  const query = `${queryStart}
                  ${fields.map((field: string) =>
                    histogramQueryStrForEachField(field),
                  )}
                }
              }
            }`;
  const queryBody: GraphQLQuery = {
    query: query,
    variables: { filter: convertFilterSetToGqlFilter(filters) },
  };

  return queryBody;
};

export const buildGetStatsAggregationQuery = (
  type: string,
  fields: ReadonlyArray<string>,
  filters: FilterSet,
  accessibility = Accessibility.ALL,
  filterSelf: boolean = false,
  queryId: string | undefined = undefined,
): GraphQLQuery => {
  const queryStart = isFilterEmpty(filters)
    ? `
              query getStatsAggs${queryId ? `_${queryId}` : ''} {
              _aggregation {
              ${type} (accessibility: ${accessibility}) {`
    : `query getStatsAggs${queryId ? `_${queryId}` : ''} ($filter: JSON) {
               _aggregation {
                      ${type} (filter: $filter, filterSelf: ${filterSelf ? 'true' : 'false'}, accessibility: ${accessibility}) { _totalCount`;
  const query = `${queryStart}
                  ${fields.map((field: string) =>
                    statsQueryStrForEachField(field),
                  )}
                }
              }
            }`;
  const queryBody: GraphQLQuery = {
    query: query,
    variables: { filter: convertFilterSetToGqlFilter(filters) },
  };

  return queryBody;
};

export const {
  useGetRawDataAndTotalCountsQuery,
  useGetAccessibleDataQuery,
  useGetAllFieldsForTypeQuery,
  useGetAggsQuery,
  useLazyGetAggsQuery,
  useGetStatsAggregationsQuery,
  useLazyGetStatsAggregationsQuery,
  useGetSubAggsQuery,
  useGetCountsQuery,
  useLazyGetCountsQuery,
  useGetFieldCountSummaryQuery,
  useGetFieldsForIndexQuery,
  useGetSharedFieldsForIndexQuery,
  useGeneralGQLQuery,
  useLazyGeneralGQLQuery,
} = explorerApi;
