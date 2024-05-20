import type { Middleware, Reducer } from '@reduxjs/toolkit';
import { coreCreateApi } from '../../api';
import { JSONObject } from '../../types';
import { GEN3_GRIP_API } from '../../constants';
import { getCookie } from 'cookies-next';
import { selectCSRFToken } from '../user';
import { CoreState } from '../../reducers';

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
  query: gripApiSliceRequest,
  headers: Record<string, string>,
): Promise<gripApiResponse<T>> => {
  const res = await fetch(`${GEN3_GRIP_API}/${query.endpoint_arg}`, {
    headers: headers,
    method: 'POST',
    body: JSON.stringify(query),
  });
  if (res.ok) return res.json();

  throw await buildGripFetchError(res);
};


  export const gripApi = coreCreateApi({
    reducerPath: 'grip',
    baseQuery: async (request: gripApiSliceRequest, api) => {
      const csrfToken = selectCSRFToken(api.getState() as CoreState);

      let accessToken = undefined;
      if (process.env.NODE_ENV === 'development') {
        // NOTE: This cookie can only be accessed from the client side
        // in development mode. Otherwise, the cookie is set as httpOnly
        accessToken = getCookie('credentials_token');
      }
      const  headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      ...(accessToken && { 'Authorization': `bearer ${accessToken}` }),
    };

    console.log("HEADERS: ", headers);
    try {
      const results = await gripApiFetch(request, headers);
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
