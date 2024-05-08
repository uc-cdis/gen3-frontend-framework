import type { Middleware, Reducer } from '@reduxjs/toolkit';
import { coreCreateApi } from '../../api';
import { JSONObject } from '../../types';
import { GEN3_GRIP_API } from '../../constants'


export interface gripApiResponse<H = JSONObject> {
  readonly data: H;
  readonly errors: Record<string, string>;
}

export interface gripFetchError {
  readonly url: string;
  readonly status: number;
  readonly statusText: string;
  readonly text: string;
  readonly variables?: Record<string, any>;
  readonly code?: Record<string, any>;
}

export interface gripApiSliceRequest {
  readonly query: string;
  readonly variables?: Record<string, unknown>;
  readonly endpoint_arg: string;

}

const buildGripFetchError = async (
  res: Response,
  variables?: Record<string, any>,
): Promise<gripFetchError> => {
  const errorData = await res.json();
  return {
    url: res.url,
    status: res.status,
    statusText: res.statusText,
    text: errorData.Message,
    code: errorData.StatusCode,
    variables: variables,
  };
};

export const gripApiFetch = async <T>(
  query: gripApiSliceRequest
): Promise<gripApiResponse<T>> => {
  const res = await fetch(`${GEN3_GRIP_API}/${query.endpoint_arg}`, {
    headers: {
      Accept: 'application/json',
      'Content-type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    method: 'POST',
    body: JSON.stringify(query),
  });

  if (res.ok) return res.json();

  throw await buildGripFetchError(res);
};


export const gripApi = coreCreateApi({
  reducerPath: 'grip',
  baseQuery: async (request: gripApiSliceRequest) => {
    try {
      const results = await gripApiFetch(request);
      return { data: results };
    } catch (e) {
      return { error: e };
    }
  },
  endpoints: () => ({}),
});

export const gripAPISliceMiddleware = gripApi.middleware as Middleware;
export const gripApiSliceReducerPath: string = gripApi.reducerPath;
export const gripApiReducer: Reducer = gripApi.reducer as Reducer;
