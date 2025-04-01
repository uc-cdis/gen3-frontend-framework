import useSWR, { Fetcher, SWRResponse } from 'swr';
import { AggregationsData, JSONObject } from '../../types';
import { Accessibility, GEN3_GUPPY_API } from '../../constants';
import { JSONPath } from 'jsonpath-plus';
import {
  convertFilterSetToGqlFilter,
  FilterSet,
  isFilterEmpty,
} from '../filters';
import { guppyApi, guppyApiSliceRequest } from './guppyApi';
import { SharedFieldMapping } from './types';
import { groupSharedFields } from './utils';

const statusEndpoint = '/_status';

export const processHistogramResponse = (
  data: Record<string, any>,
): AggregationsData => {
  const valueData = JSONPath({
    json: data,
    path: '$..histogram',
    resultType: 'value',
  });

  const pointerData = JSONPath({
    json: data,
    path: '$..histogram',
    resultType: 'pointer',
  });

  const results = pointerData.reduce(
    (acc: AggregationsData, element: Record<string, any>, idx: number) => {
      const key = element
        .slice(1)
        .replace(/\/histogram/g, '')
        .replace(/\//g, '.');
      return {
        ...acc,
        [key]: valueData[idx],
      };
    },
    {} as AggregationsData,
  );
  return results as AggregationsData;
};

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

interface AccessibleDataSliceParams {
  type: string;
  fields: ReadonlyArray<string>;
  accessType: Accessibility;
}

interface QueryAggsParams {
  type: string;
  fields: ReadonlyArray<string>;
  filters: FilterSet;
  accessibility?: Accessibility;
}

interface QueryForSubAggsParams {
  type: string;
  mainField: string;
  numericAggAsText: boolean;
  termsFields?: ReadonlyArray<string>;
  missingFields?: ReadonlyArray<string>;
  gqlFilter?: FilterSet;
  accessibility?: Accessibility;
}

interface QueryCountsParams {
  type: string;
  filters: FilterSet;
  accessibility?: Accessibility;
}

interface QueryForFileCountSummaryParams {
  type: string;
  field: string;
  filters: FilterSet;
  accessibility?: Accessibility;
}

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
const explorerApi = guppyApi.injectEndpoints({
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
      query: ({ type, fields, accessType }: AccessibleDataSliceParams) => {
        const fieldParts = fields.map(
          (field) => `${field} { histogram { key count } }`,
        );
        return {
          query: `_aggregation {
              ${type} (accessibility: ${accessType}) {
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
    }),
    getAggs: builder.query<AggregationsData, QueryAggsParams>({
      query: ({
        type,
        fields,
        filters,
        accessibility = Accessibility.ALL,
      }: QueryAggsParams) => {
        const queryStart = isFilterEmpty(filters)
          ? `
              query getAggs {
              _aggregation {
              ${type} (accessibility: ${accessibility}) {`
          : `query getAggs ($filter: JSON) {
               _aggregation {
                      ${type} (filter: $filter, filterSelf: false, accessibility: ${accessibility}) {`;
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
      },
      transformResponse: (response: Record<string, any>, _meta, args) => {
        return processHistogramResponse(
          response?.data?._aggregation[args.type] ?? {},
        );
      },
    }),
    getAggsNoFilterSelf: builder.query<AggregationsData, QueryAggsParams>({
      query: ({
        type,
        fields,
        filters,
        accessibility = Accessibility.ALL,
      }: QueryAggsParams) => {
        const queryStart = isFilterEmpty(filters)
          ? `
              query getAggs {
              _aggregation {
              ${type} (accessibility: ${accessibility}) {`
          : `query getAggs ($filter: JSON) {
               _aggregation {
                      ${type} (filter: $filter, filterSelf: true, accessibility: ${accessibility}) {`;
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
      },
      transformResponse: (response: Record<string, any>, _meta, args) => {
        return processHistogramResponse(
          response?.data?._aggregation[args.type] ?? {},
        );
      },
    }),
    getSubAggs: builder.query<AggregationsData, QueryForSubAggsParams>({
      query: ({
        type,
        mainField,
        termsFields = undefined,
        missingFields = undefined,
        numericAggAsText = false,
        gqlFilter = undefined,
        accessibility = Accessibility.ALL,
      }: QueryForSubAggsParams) => {
        const nestedAggFields = {
          termsFields: termsFields,
          missingFields: missingFields,
        };

        const query = `query getSubAggs ( ${
          gqlFilter ?? '$filter: JSON,'
        } $nestedAggFields: JSON) {
    _aggregation {
      ${type} ( ${
        gqlFilter ?? 'filter: $filter, filterSelf: false,'
      } nestedAggFields: $nestedAggFields, accessibility: ${accessibility}) {
        ${nestedHistogramQueryStrForEachField(mainField, numericAggAsText)}
      }`;

        return {
          query: query,
          variables: {
            ...(gqlFilter && {
              filter: convertFilterSetToGqlFilter(gqlFilter),
            }),
            nestedAggFields: nestedAggFields,
          },
        };
      },
      transformResponse: (response: Record<string, any>, _meta, args) => {
        return processHistogramResponse(
          response?.data?._aggregation[args.type] ?? {},
        );
      },
    }),
    getCounts: builder.query<number, QueryCountsParams>({
      query: ({
        type,
        filters,
        accessibility = Accessibility.ALL,
      }: QueryCountsParams) => {
        const gqlFilters = convertFilterSetToGqlFilter(filters);
        const queryLine = `query totalCounts ${
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

// query for aggregate data
// convert the function below to typescript

const histogramQueryStrForEachField = (field: string): string => {
  const splittedFieldArray = field.split('.');
  const splittedField = splittedFieldArray.shift();
  if (splittedFieldArray.length === 0) {
    return `
    ${splittedField} {
      histogram {
        key
        count
      }
    }`;
  }
  return `
  ${splittedField} {
    ${histogramQueryStrForEachField(splittedFieldArray.join('.'))}
  }`;
};

const nestedHistogramQueryStrForEachField = (
  mainField: string,
  numericAggAsText: boolean,
) => `
  ${mainField} {
    ${numericAggAsText ? 'asTextHistogram' : 'histogram'} {
      key
      count
      missingFields {
        field
        count
      }
      termsFields {
        field
        count
        terms {
          key
          count
        }
      }
    }
  }`;

export const rawDataQueryStrForEachField = (field: string): string => {
  const splitFieldArray = field.split('.');
  const splitField = splitFieldArray.shift();
  if (splitFieldArray.length === 0) {
    return `
    ${splitField}
    `;
  }
  return `
  ${splitField} {
    ${rawDataQueryStrForEachField(splitFieldArray.join('.'))}
  }`;
};

export const useGetArrayTypes = () => {
  {
    const { data, error } = useGetStatus();
    if (error) {
      return {};
    }
    return data ? data['indices'] : {};
  }
};

export const {
  useGetRawDataAndTotalCountsQuery,
  useGetAccessibleDataQuery,
  useGetAllFieldsForTypeQuery,
  useGetAggsQuery,
  useGetAggsNoFilterSelfQuery,
  useLazyGetAggsQuery,
  useGetSubAggsQuery,
  useGetCountsQuery,
  useGetFieldCountSummaryQuery,
  useGetFieldsForIndexQuery,
  useGetSharedFieldsForIndexQuery,
  useGeneralGQLQuery,
  useLazyGeneralGQLQuery,
} = explorerApi;
