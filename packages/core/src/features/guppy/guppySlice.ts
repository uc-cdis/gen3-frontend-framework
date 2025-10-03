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

/*
  returns all the fields for a given type
  @param type: the type to get fields for
  @returns: a list of fields for the given type
 */

interface GuppyBaseQueryParams {
  type: string;
  filters: FilterSet;
  accessibility?: Accessibility;
  indexPrefix?: string;
  filterName?: string;
}

interface AccessibleDataSliceParams {
  type: string;
  fields: ReadonlyArray<string>;
  accessibility: Accessibility;
  indexPrefix?: string;
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

export interface RawDataAndTotalCountsParams extends GuppyBaseQueryParams {
  fields: string[];
  sort?: ReadonlyArray<Record<string, 'asc' | 'desc'>>;
  offset?: number;
  size?: number;
  format?: string;
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
      query: ({
        type,
        indexPrefix = '',
      }: {
        type: string;
        indexPrefix?: string;
      }) => ({
        query: `{ ${indexPrefix}_mapping ${type} } }`,
      }),
      transformResponse: (response: Record<string, any>, _meta, params) => {
        return response[params.type];
      },
    }),
    getAccessibleData: builder.query({
      query: ({
        type,
        fields,
        accessibility,
        indexPrefix = '',
      }: AccessibleDataSliceParams) => {
        const fieldParts = fields.map(
          (field) => `${field} { histogram { key count } }`,
        );
        return {
          query: `${indexPrefix}_aggregation {
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
        indexPrefix = '',
        filterName = 'filter',
      }: RawDataAndTotalCountsParams) => {
        const gqlFilter = convertFilterSetToGqlFilter(filters);
        const params = [
          ...(sort ? ['$sort: JSON'] : []),
          ...(gqlFilter ? [`$${filterName}: JSON`] : []),
          ...(format ? ['$format: Format'] : []),
        ].join(',');
        const queryLine = `query getRawDataAndTotalCounts (${params}) {`;

        const dataParams = [
          ...(format ? ['format: $format'] : []),
          ...(sort ? ['sort: $sort'] : []),
          ...(gqlFilter ? [`filter: $${filterName}`] : []),
        ].join(',');
        const dataTypeLine = `${indexPrefix}${type} (accessibility: ${accessibility}, offset: ${offset}, first: ${size},
        ${dataParams}) {`;

        const typeAggsLine = `${type} (${
          gqlFilter && `filter: $${filterName},`
        } accessibility: ${accessibility}) {`;

        const processedFields = fields.map((field) =>
          rawDataQueryStrForEachField(field),
        );

        const query = `${queryLine}
    ${dataTypeLine}
      ${processedFields.join(' ')}
            }
            ${indexPrefix}_aggregation {
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
      // return . seperated fields as proper values
      transformResponse: (response: Record<string, any>, _meta, args) => {
        const containsDots = args?.fields?.filter((f) => f.includes('.'));
        // check if dot seperated in arry and not object
        if (containsDots && containsDots.length > 0 && response.data) {
          const containsDotsUniqueBase = containsDots.reduce((acc, field) => {
            const partsArr = field.split('.');
            if (partsArr.length < 2) {
              throw new Error('Not made to handle filds with more than one dot');
            }
            const basePart = partsArr[0];
            if (!acc.includes(basePart)) {
              acc.push(basePart);
            }
            return acc;
          }, [] as string[]);

          // checks if api is returning an array of objects for the base part
          // if so, it restructures the object to group the sub parts into arrays
          // e.g. {a: [{b: 1, c:2}, {b:3, c:4}]} becomes {a: {b: [1,3], c:[2,4]}}
          // this is to make it easier to work with in the table component
          // currently only supports one level of nesting
          // also puts original into subRows for dropdown viewing
          const tempResponse = response.data[args.type].map((item: Record<string, any>) => {
            const tempItem = item;
            for (let i = 0; i < containsDotsUniqueBase.length; i++) {
              const basePart = containsDotsUniqueBase[i];
              if (item[basePart] && Array.isArray(item[basePart])) {

                // move original to subRows
                tempItem.subRows = tempItem[basePart];

                tempItem[basePart] = tempItem[basePart].reduce((acc: Record<string, any>, obj: Record<string, any>) => {
                  for (const key in obj) {
                    if (obj.hasOwn(key)) {
                      if (!acc[key]) {
                        acc[key] = [];
                      }
                      acc[key].push(obj[key]);
                    }
                  }
                  return acc;
                }, {});
              }
            };
            return tempItem;
          });

          return {data: {_aggregation: response.data._aggregation, [args.type]: tempResponse}};
        }
        return response;
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
        indexPrefix = '',
        filterName = 'filter',
      }: QueryAggsParams) => {
        return buildGetAggregationQuery(
          type,
          fields,
          filters,
          accessibility,
          filterSelf,
          undefined,
          indexPrefix,
          filterName,
        );
      },
      transformResponse: (response: Record<string, any>, _meta, args) => {
        const buckets = processHistogramResponse<AggregationsData>(
          response?.data?.[`${args?.indexPrefix ?? ''}_aggregation`][
            args.type
          ] ?? {},
        );

        // check for totals
        const count =
          response?.data?.[`${args?.indexPrefix ?? ''}_aggregation`][args.type]
            ?._totalCount ?? null;

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
        indexPrefix = '',
        filterName = 'filter',
      }: QueryAggsParams) => {
        return buildGetStatsAggregationQuery(
          type,
          fields,
          filters,
          accessibility,
          filterSelf,
          queryId,
          indexPrefix,
          filterName,
        );
      },
      transformResponse: (response: Record<string, any>, _meta, args) => {
        return processHistogramResponse<StatsData>(
          response?.data?.[`${args?.indexPrefix ?? ''}_aggregation`][
            args.type
          ] ?? {},
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
        indexPrefix = '',
        filterName = 'filter',
      }: QueryForSubAggsParams) => {
        const nestedAggFields = {
          termsFields: termsFields,
          missingFields: missingFields,
        };

        const query = `query getSubAggs ( ${
          filters ?? `$${filterName}: JSON,`
        } $nestedAggFields: JSON) {
    ${indexPrefix}_aggregation {
      ${type} ( ${
        filters ?? `filter: $${filterName}, filterSelf: false,`
      } nestedAggFields: $nestedAggFields, accessibility: ${accessibility}) {
      _totalCounts
        ${nestedHistogramQueryStrForEachField(mainField, numericAggAsText)}
      }`;

        return {
          query: query,
          variables: {
            ...(filters && {
              [filterName]: convertFilterSetToGqlFilter(filters),
            }),
            nestedAggFields: nestedAggFields,
          },
        };
      },
      transformResponse: (response: Record<string, any>, _meta, args) => {
        return processHistogramResponse<AggregationsData>(
          response?.data?.[`${args?.indexPrefix ?? ''}_aggregation`][
            args.type
          ] ?? {},
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
        indexPrefix = '',
        filterName = 'filter',
      }: QueryCountsParams) => {
        const gqlFilters = convertFilterSetToGqlFilter(filters);
        const queryLine = `query totalCounts${queryId ? `${indexPrefix}_${queryId}` : ''} ${
          gqlFilters ? `($${filterName}: JSON)` : ''
        }{`;
        const typeAggsLine = `${type} ${
          gqlFilters ? `(filter: $${filterName}, ` : '('
        } accessibility: ${accessibility}) {`;

        const query = `${queryLine} ${indexPrefix}_aggregation {
          ${typeAggsLine}
            _totalCount
            }
           }
        }`;
        return {
          query: query,
          variables: {
            ...(gqlFilters && {
              [filterName]: gqlFilters,
            }),
          },
        };
      },
      transformResponse: (
        response: Record<string, any>,
        _meta,
        args,
      ): number => {
        if (
          !response.data ||
          !response.data[`${args?.indexPrefix ?? ''}_aggregation`]
        ) {
          throw new Error(
            'Invalid response: Missing data or _aggregation field',
          );
        }

        if (
          !(
            args.type in response.data[`${args?.indexPrefix ?? ''}_aggregation`]
          )
        ) {
          throw new Error(
            `Invalid response: Missing expected key '${args.type}' in _aggregation`,
          );
        }
        return (
          response.data[`${args?.indexPrefix ?? ''}_aggregation`][args.type]
            ._totalCount ?? 0
        );
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
        indexPrefix = '',
        filterName = 'filter',
      }: QueryForFileCountSummaryParams) => {
        const gqlFilters = convertFilterSetToGqlFilter(filters);
        const query = `query summary ($${filterName}: JSON) {
        ${indexPrefix}_aggregation {
          ${type} (filter: $${filterName}, accessibility: ${accessibility}) {
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
              [filterName]: gqlFilters,
            }),
          },
        };
      },
    }),
    getFieldsForIndex: builder.query({
      query: ({
        index,
        indexPrefix = '',
      }: {
        index: string;
        indexPrefix: string | undefined;
      }) => {
        return {
          query: `{
            ${indexPrefix}_mapping { ${index} }
          }`,
        };
      },
      transformResponse: (response: Record<string, any>, _meta, args) => {
        return response[`${args.indexPrefix}_mapping`];
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

export const useGetIndexFields = (index: string, indexPrefix = '') => {
  const { data } = useGetFieldsForIndexQuery({
    index: index,
    indexPrefix: indexPrefix,
  });
  return data ?? [];
};

export const buildGetAggregationQuery = (
  type: string,
  fields: ReadonlyArray<string>,
  filters: FilterSet,
  accessibility = Accessibility.ALL,
  filterSelf: boolean = false,
  queryId: string | undefined = undefined,
  indexPrefix: string = '',
  filterName: string = 'filter',
): GraphQLQuery => {
  const queryStart = isFilterEmpty(filters)
    ? `query getAggs${queryId ? `_${queryId}` : ''} {
              ${indexPrefix}_aggregation {
              ${type} (accessibility: ${accessibility}) {`
    : `query getAggs ($${filterName}: JSON) {
               ${indexPrefix}_aggregation {
                      ${type} (filter: $${filterName}, filterSelf: ${filterSelf ? 'true' : 'false'}, accessibility: ${accessibility}) { _totalCount`;
  const query = `${queryStart}
                  ${fields.map((field: string) =>
                    histogramQueryStrForEachField(field),
                  )}
                }
              }
            }`;
  const queryBody: GraphQLQuery = {
    query: query,
    variables: { [filterName]: convertFilterSetToGqlFilter(filters) },
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
  indexPrefix: string = '',
  filterName: string = 'filter',
): GraphQLQuery => {
  const queryStart = isFilterEmpty(filters)
    ? `
              query getStatsAggs${queryId ? `_${queryId}` : ''} {
              ${indexPrefix}_aggregation {
              ${type} (accessibility: ${accessibility}) {`
    : `query getStatsAggs${queryId ? `_${queryId}` : ''} ($${filterName}: JSON) {
               ${indexPrefix}_aggregation {
                      ${type} (filter: $${filterName}, filterSelf: ${filterSelf ? 'true' : 'false'}, accessibility: ${accessibility}) { _totalCount`;
  const query = `${queryStart}
                  ${fields.map((field: string) =>
                    statsQueryStrForEachField(field),
                  )}
                }
              }
            }`;
  const queryBody: GraphQLQuery = {
    query: query,
    variables: { [filterName]: convertFilterSetToGqlFilter(filters) },
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
