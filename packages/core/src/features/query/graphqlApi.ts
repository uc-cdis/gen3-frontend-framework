import type { Middleware, Reducer } from '@reduxjs/toolkit';
import { GEN3_GUPPY_API } from '../../constants';
import { coreCreateApi } from '../../api';
import { JSONObject } from '../../types';

export interface GraphQLFetchError {
  readonly url: string;
  readonly status: number;
  readonly statusText: string;
  readonly text: string;
  readonly variables?: Record<string, any>;
}

export interface GraphqlApiSliceRequest {
  readonly query: string;
  readonly variables?: Record<string, unknown>;
}

export interface GraphQLApiResponse<H = JSONObject> {
  readonly data: H;
  readonly errors: Record<string, string>;
}

export interface SortOption {
  field: string;
  order: string;
}

export interface TablePageOffsetProps {
  readonly pageSize?: number;
  readonly offset?: number;
  readonly sorts?: Array<SortOption>;
  readonly searchTerm?: string;
}

const buildGraphQLFetchError = async (
  res: Response,
  variables?: Record<string, any>
): Promise<GraphQLFetchError> => {
  const errorData = await res.json();
  return {
    url: res.url,
    status: res.status,
    statusText: res.statusText,
    text: errorData.message,
    variables: variables,
  };
};

export const graphqlAPI = async <T>(
  query: GraphqlApiSliceRequest
): Promise<GraphQLApiResponse<T>> => {
  const res = await fetch(`${GEN3_GUPPY_API}/graphql`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    method: 'POST',
    body: JSON.stringify(query),
  });

  if (res.ok) return res.json();

  throw await buildGraphQLFetchError(res, query);
};

export const graphqlAPISlice = coreCreateApi({
  reducerPath: 'graphql',
  baseQuery: async (request: GraphqlApiSliceRequest) => {
    let results: GraphQLApiResponse<any>;

    try {
      results = await graphqlAPI(request);
    } catch (e) {
      return { error: e };
    }

    return { data: results };
  },
  endpoints: () => ({}),
});

export const graphqlAPISliceMiddleware =
  graphqlAPISlice.middleware as Middleware;
export const graphqlAPISliceReducerPath: string = graphqlAPISlice.reducerPath;
export const graphqlAPIReducer: Reducer = graphqlAPISlice.reducer as Reducer;
