import { useState } from 'react';
import useSWR from 'swr';
import {
  Accessibility,
  convertFilterSetToGqlFilter,
  FilterSet,
  isFilterEmpty,
  GraphQLQuery,
} from '@gen3/core';
import { getCookie } from 'cookies-next';

interface ErrorDetails {
  status: string;
  message: string;
}

export const useGraphQLData = <TResponse = unknown, TBody = unknown>(
  url: string,
  body: TBody,
) => {
  // Create a fetcher function that handles the GraphQL POST request
  const fetcher = async (fetchUrl: string, fetchBody: TBody) => {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    if (process.env.NODE_ENV === 'development') {
      // NOTE: This cookie can only be accessed from the client side
      // in development mode. Otherwise, the cookie is set as httpOnly
      const accessToken = getCookie('credentials_token');
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
    }

    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(fetchBody),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  };

  // Use SWR with the fetcher
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    TResponse,
    Error
  >([url, body], ([fetchUrl, fetchBody]) => fetcher(fetchUrl, fetchBody), {
    revalidateOnFocus: false, // Disable auto revalidation on window focus
    // Add any other SWR options you need here
  });

  // Format error to match your ErrorDetails interface
  const formattedError = error
    ? ({
        status: error.message.match(/\d+/)?.[0] || 'Unknown',
        message: error.message,
      } as ErrorDetails)
    : null;

  return {
    data,
    isLoading,
    isSuccess: !!data && !error,
    isError: !!error,
    error: formattedError,
    mutate, // Allow manual revalidation if needed
  };
};

interface UsePostDataState<TResponse> {
  data: TResponse | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: ErrorDetails | null;
}

export const usePostData = <TResponse = unknown, TBody = unknown>(
  url: string,
) => {
  const [state, setState] = useState<UsePostDataState<TResponse>>({
    data: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
  });

  const handleFetchError = (error: Error): ErrorDetails => ({
    status: error.message.match(/\d+/)?.[0] || 'Unknown',
    message: error.message,
  });

  const postData = async (body: TBody): Promise<void> => {
    setState((prevState) => ({
      ...prevState,
      isLoading: true,
      isSuccess: false,
      isError: false,
      error: null,
    }));

    try {
      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      if (process.env.NODE_ENV === 'development') {
        // NOTE: This cookie can only be accessed from the client side
        // in development mode. Otherwise, the cookie is set as httpOnly
        const accessToken = getCookie('credentials_token');
        if (accessToken) {
          headers.set('Authorization', `Bearer ${accessToken}`);
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result: TResponse = await response.json();
      setState((prevState) => ({
        ...prevState,
        data: result,
        isSuccess: true,
      }));
    } catch (err) {
      if (err instanceof Error) {
        setState((prevState) => ({
          ...prevState,
          isError: true,
          error: handleFetchError(err),
        }));
      }
    } finally {
      setState((prevState) => ({
        ...prevState,
        isLoading: false,
      }));
    }
  };

  return { postData, ...state };
};

interface QueryAggsParams {
  type: string;
  fields: ReadonlyArray<string>;
  filters: FilterSet;
  accessibility?: Accessibility;
}

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

export const buildGetAggregationQuery = (
  type: string,
  fields: ReadonlyArray<string>,
  filters: FilterSet,
  accessibility = Accessibility.ALL,
): GraphQLQuery => {
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
};

// import { cohortDiscoveryApi } from './appApi';
//
// import {
//   Accessibility,
//   convertFilterSetToGqlFilter,
//   FilterSet,
//   isFilterEmpty,
//   AggregationsData,
//   RawDataAndTotalCountsParams,
//   GraphQLQuery,
// } from '@gen3/core';
//
// /*
//   returns all the fields for a given type
//   @param type: the type to get fields for
//   @returns: a list of fields for the given type
//  */
//
// interface AccessibleDataSliceParams {
//   type: string;
//   fields: ReadonlyArray<string>;
//   accessType: Accessibility;
// }
//
// interface QueryAggsParams {
//   type: string;
//   fields: ReadonlyArray<string>;
//   filters: FilterSet;
//   accessibility?: Accessibility;
// }
//
// interface QueryForSubAggsParams {
//   type: string;
//   mainField: string;
//   numericAggAsText: boolean;
//   termsFields?: ReadonlyArray<string>;
//   missingFields?: ReadonlyArray<string>;
//   gqlFilter?: FilterSet;
//   accessibility?: Accessibility;
// }
//
// interface QueryCountsParams {
//   type: string;
//   filters: FilterSet;
//   accessibility?: Accessibility;
// }
//
// interface QueryForFileCountSummaryParams {
//   type: string;
//   field: string;
//   filters: FilterSet;
//   accessibility?: Accessibility;
// }
//
// /**
//  * The main endpoint used in templating Exploration page queries.
//  * Includes table, filter and aggregation query types and leverages guppyApi defined in ./gupplApi.ts
//  * Query templates support filters where applicable
//  *
//  * @param endpoints - Defines endpoints used in Exploration page:
//  * @param getAllFieldsForType - A mapping query that returns all property key names vertex types specified.
//  *   @see https://github.com/uc-cdis/guppy/blob/master/doc/queries.md#mapping-query
//  * @param getAccessibleData - An aggregation histogram counts query that filters based on access type
//  *   @see https://github.com/uc-cdis/guppy/blob/master/doc/queries.md#accessibility-argument-for-regular-tier-access-level
//  * @param getRawDataAndTotalCounts - Queries both _totalCount for selected vertex types and
//  * tabular results containing the raw data in the rows of selected vertex types
//  *   @see https://github.com/uc-cdis/guppy/blob/master/doc/queries.md#1-total-count-aggregation
//  * @param getAggs - An aggregated histogram counts query which outputs vertex property frequencies
//  * @param getSubAggs - TODO: not sure what this one does. Looks like nested aggregation
//  * @param getCounts - Returns total counts of a vertex type
//  * @returns: A guppy API endpoint for templating queryable data displayed on the exploration page
//  */
// const explorerApi = cohortDiscoveryApi.injectEndpoints({
//   endpoints: (builder) => ({
//     getAllFieldsForType: builder.query({
//       query: (type: { type: string }) => ({
//         query: `{ _mapping ${type} } }`,
//       }),
//       transformResponse: (response: Record<string, any>, _meta, params) => {
//         return response[params.type];
//       },
//     }),
//     getAccessibleData: builder.query({
//       query: ({ type, fields, accessType }: AccessibleDataSliceParams) => {
//         const fieldParts = fields.map(
//           (field) => `${field} { histogram { key count } }`,
//         );
//       },
//     }),
//     getRawDataAndTotalCounts: builder.query({
//       query: ({
//         type,
//         fields,
//         filters,
//         sort,
//         offset = 0,
//         size = 20,
//         accessibility = Accessibility.ALL,
//         format = undefined,
//       }: RawDataAndTotalCountsParams) => {
//         const gqlFilter = convertFilterSetToGqlFilter(filters);
//         const params = [
//           ...(sort ? ['$sort: JSON'] : []),
//           ...(gqlFilter ? ['$filter: JSON'] : []),
//           ...(format ? ['$format: Format'] : []),
//         ].join(',');
//         const queryLine = `query getRawDataAndTotalCounts (${params}) {`;
//
//         const dataParams = [
//           ...(format ? ['format: $format'] : []),
//           ...(sort ? ['sort: $sort'] : []),
//           ...(gqlFilter ? ['filter: $filter'] : []),
//         ].join(',');
//         const dataTypeLine = `${type} (accessibility: ${accessibility}, offset: ${offset}, first: ${size},
//         ${dataParams}) {`;
//
//         const typeAggsLine = `${type} (${
//           gqlFilter && 'filter: $filter,'
//         } accessibility: ${accessibility}) {`;
//
//         const processedFields = fields.map((field) =>
//           rawDataQueryStrForEachField(field),
//         );
//
//         const query = `${queryLine}
//     ${dataTypeLine}
//       ${processedFields.join(' ')}
//             }
//             _aggregation {
//               ${typeAggsLine}
//                 _totalCount
//               }
//             }
//         }`;
//         const variables = {
//           ...(sort && { sort }),
//           ...(gqlFilter && { filter: gqlFilter }),
//           ...(format && { format }),
//         };
//         return { query, variables };
//       },
//     }),
//     getAggs: builder.query<AggregationsData, QueryAggsParams>({
//       query: ({
//         type,
//         fields,
//         filters,
//         accessibility = Accessibility.ALL,
//       }: QueryAggsParams) => {
//         const queryStart = isFilterEmpty(filters)
//           ? `
//               query getAggs {
//               _aggregation {
//               ${type} (accessibility: ${accessibility}) {`
//           : `query getAggs ($filter: JSON) {
//                _aggregation {
//                       ${type} (filter: $filter, filterSelf: false, accessibility: ${accessibility}) {`;
//         const query = `${queryStart}
//                   ${fields.map((field: string) =>
//                     histogramQueryStrForEachField(field),
//                   )}
//                 }
//               }
//             }`;
//         const queryBody: GraphQLQuery = {
//           query: query,
//           variables: { filter: convertFilterSetToGqlFilter(filters) },
//         };
//         return queryBody;
//       },
//     }),
//     getAggsNoFilterSelf: builder.query<AggregationsData, QueryAggsParams>({
//       query: ({
//         type,
//         fields,
//         filters,
//         accessibility = Accessibility.ALL,
//       }: QueryAggsParams) => {
//         const queryStart = isFilterEmpty(filters)
//           ? `
//               query getAggs {
//               _aggregation {
//               ${type} (accessibility: ${accessibility}) {`
//           : `query getAggs ($filter: JSON) {
//                _aggregation {
//                       ${type} (filter: $filter, filterSelf: true, accessibility: ${accessibility}) {`;
//         const query = `${queryStart}
//                   ${fields.map((field: string) =>
//                     histogramQueryStrForEachField(field),
//                   )}
//                 }
//               }
//             }`;
//         const queryBody: GraphQLQuery = {
//           query: query,
//           variables: { filter: convertFilterSetToGqlFilter(filters) },
//         };
//         return queryBody;
//       },
//     }),
//     getSubAggs: builder.query<AggregationsData, QueryForSubAggsParams>({
//       query: ({
//         type,
//         mainField,
//         termsFields = undefined,
//         missingFields = undefined,
//         numericAggAsText = false,
//         gqlFilter = undefined,
//         accessibility = Accessibility.ALL,
//       }: QueryForSubAggsParams) => {
//         const nestedAggFields = {
//           termsFields: termsFields,
//           missingFields: missingFields,
//         };
//
//         const query = `query getSubAggs ( ${
//           gqlFilter ?? '$filter: JSON,'
//         } $nestedAggFields: JSON) {
//     _aggregation {
//       ${type} ( ${
//         gqlFilter ?? 'filter: $filter, filterSelf: false,'
//       } nestedAggFields: $nestedAggFields, accessibility: ${accessibility}) {
//         ${nestedHistogramQueryStrForEachField(mainField, numericAggAsText)}
//       }`;
//
//         return {
//           query: query,
//           variables: {
//             ...(gqlFilter && {
//               filter: convertFilterSetToGqlFilter(gqlFilter),
//             }),
//             nestedAggFields: nestedAggFields,
//           },
//         };
//       },
//     }),
//     getCounts: builder.query<number, QueryCountsParams>({
//       query: ({
//         type,
//         filters,
//         accessibility = Accessibility.ALL,
//       }: QueryCountsParams) => {
//         const gqlFilters = convertFilterSetToGqlFilter(filters);
//         const queryLine = `query totalCounts ${
//           gqlFilters ? '($filter: JSON)' : ''
//         }{`;
//         const typeAggsLine = `${type} ${
//           gqlFilters ? '(filter: $filter, ' : '('
//         } accessibility: ${accessibility}) {`;
//
//         const query = `${queryLine} _aggregation {
//           ${typeAggsLine}
//             _totalCount
//             }
//            }
//         }`;
//         return {
//           query: query,
//           variables: {
//             ...(gqlFilters && {
//               filter: gqlFilters,
//             }),
//           },
//         };
//       },
//     }),
//     getFieldCountSummary: builder.query<
//       Record<string, any>,
//       QueryForFileCountSummaryParams
//     >({
//       query: ({
//         type,
//         field,
//         filters,
//         accessibility = Accessibility.ALL,
//       }: QueryForFileCountSummaryParams) => {
//         const gqlFilters = convertFilterSetToGqlFilter(filters);
//         const query = `query summary ($filter: JSON) {
//         _aggregation {
//           ${type} (filter: $filter, accessibility: ${accessibility}) {
//             ${field} {
//               histogram {
//                 sum,
//               }
//             }
//           }
//         }
//       }`;
//         return {
//           query: query,
//           variables: {
//             ...(gqlFilters && {
//               filter: gqlFilters,
//             }),
//           },
//         };
//       },
//     }),
//     getFieldsForIndex: builder.query({
//       query: (index: string) => {
//         return {
//           query: `{
//             _mapping { ${index} }
//           }`,
//         };
//       },
//     }),
//   }),
// });
//
// // query for aggregate data
// // convert the function below to typescript
//
// const histogramQueryStrForEachField = (field: string): string => {
//   const splittedFieldArray = field.split('.');
//   const splittedField = splittedFieldArray.shift();
//   if (splittedFieldArray.length === 0) {
//     return `
//     ${splittedField} {
//       histogram {
//         key
//         count
//       }
//     }`;
//   }
//   return `
//   ${splittedField} {
//     ${histogramQueryStrForEachField(splittedFieldArray.join('.'))}
//   }`;
// };
//
// const nestedHistogramQueryStrForEachField = (
//   mainField: string,
//   numericAggAsText: boolean,
// ) => `
//   ${mainField} {
//     ${numericAggAsText ? 'asTextHistogram' : 'histogram'} {
//       key
//       count
//       missingFields {
//         field
//         count
//       }
//       termsFields {
//         field
//         count
//         terms {
//           key
//           count
//         }
//       }
//     }
//   }`;
//
// export const rawDataQueryStrForEachField = (field: string): string => {
//   const splitFieldArray = field.split('.');
//   const splitField = splitFieldArray.shift();
//   if (splitFieldArray.length === 0) {
//     return `
//     ${splitField}
//     `;
//   }
//   return `
//   ${splitField} {
//     ${rawDataQueryStrForEachField(splitFieldArray.join('.'))}
//   }`;
// };
//
// export const {
//   useGetRawDataAndTotalCountsQuery,
//   useGetAccessibleDataQuery,
//   useGetAllFieldsForTypeQuery,
//   useGetAggsQuery,
//   useGetAggsNoFilterSelfQuery,
//   useLazyGetAggsQuery,
//   useGetSubAggsQuery,
//   useGetCountsQuery,
//   useGetFieldCountSummaryQuery,
//   useGetFieldsForIndexQuery,
// } = explorerApi;
