import type { Middleware, Reducer } from '@reduxjs/toolkit';
import { coreCreateApi } from '../../api';
import { JSONObject } from '../../types';
import { GEN3_GUPPY_API } from '../../constants';
import { CoreState } from '../../reducers';
import { getCookie } from 'cookies-next';
import { selectCSRFToken } from '../user';

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

/**
 * Creates a base class core API for guppy API calls.
 * @returns: guppy core API with guppyAPIFetch base query
 */
export const guppyApi = coreCreateApi({
  reducerPath: 'guppy',

  // TODO: refactor to use fetchBaseQuery
  baseQuery: async (query: guppyApiSliceRequest, api) => {
    const csrfToken = selectCSRFToken(api.getState() as CoreState);

    let accessToken = undefined;
    if (process.env.NODE_ENV === 'development') {
      // NOTE: This cookie can only be accessed from the client side
      // in development mode. Otherwise, the cookie is set as httpOnly
      accessToken = getCookie('credentials_token');
    }

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };
    try {
      const response = await fetch(`${GEN3_GUPPY_API}/graphql`, {
        headers: headers,
        method: 'POST',
        body: JSON.stringify(query),
      });
      return { data: await response.json() };
    } catch (e: unknown) {
      if (e instanceof Error) return { error: e.message };
      return { error: e };
    }
  },
  endpoints: () => ({}),
});

export const guppyAPISliceMiddleware = guppyApi.middleware as Middleware;
export const guppyApiSliceReducerPath: string = guppyApi.reducerPath;
export const guppyApiReducer: Reducer = guppyApi.reducer as Reducer;
