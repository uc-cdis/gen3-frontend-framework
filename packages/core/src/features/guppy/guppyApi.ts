import type { Middleware, Reducer } from '@reduxjs/toolkit';
import { coreCreateApi } from '../../api';
import { JSONObject } from '../../types';
import { GEN3_GUPPY_API } from '../../constants';

export interface guppyFetchError {
  readonly url: string;
  readonly status: number;
  readonly statusText: string;
  readonly text: string;
  readonly variables?: Record<string, any>;
}

export interface guppyApiSliceRequest {
  readonly query: string;
  readonly variables?: Record<string, unknown>;
}

export interface guppyApiResponse<H = JSONObject> {
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

const buildGuppyFetchError = async (
  res: Response,
  variables?: Record<string, any>,
): Promise<guppyFetchError> => {
  const errorData = await res.json();
  return {
    url: res.url,
    status: res.status,
    statusText: res.statusText,
    text: errorData.message,
    variables: variables,
  };
};

/**
 * Similar to graphQLAPI except this
 * guppyAPIFetch function is a branch of guppy core API defined below and
 * graphQLAPI is a branch of gen3Services API.
 */
export const guppyAPIFetch = async <T>(
  query: guppyApiSliceRequest,
): Promise<guppyApiResponse<T>> => {
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

  throw await buildGuppyFetchError(res, query);
};

/**
 * Creates a base class core API for guppy API calls.
 * @returns: guppy core API with guppyAPIFetch base query
 */
export const guppyApi = coreCreateApi({
  reducerPath: 'guppy',

  // TODO: refactor to use fetchBaseQuery
  baseQuery: async (request: guppyApiSliceRequest) => {
    try {
      const results = await guppyAPIFetch(request);
      return { data: results };
    } catch (e) {
      return { error: e };
    }
  },
  endpoints: () => ({}),
});

export const guppyAPISliceMiddleware = guppyApi.middleware as Middleware;
export const guppyApiSliceReducerPath: string = guppyApi.reducerPath;
export const guppyApiReducer: Reducer = guppyApi.reducer as Reducer;
