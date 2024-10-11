import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { GEN3_API } from '@gen3/core';
import { getCookie } from 'cookies-next';
import { Middleware, Reducer } from '@reduxjs/toolkit';
import { appCreateApi } from './appCreateApi';
import { JSONObject } from '@gen3/core/dist/dts';

export interface DiversityRequestParams {
  dataset: string;
}

export const diversityApi = appCreateApi({
  reducerPath: 'diversityApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${GEN3_API}`,
    prepareHeaders: (headers, { getState }) => {
      headers.set('Content-Type', 'application/json');
      let accessToken = undefined;
      if (process.env.NODE_ENV === 'development') {
        // NOTE: This cookie can only be accessed from the client side
        // in development mode. Otherwise, the cookie is set as httpOnly
        accessToken = getCookie('credentials_token');
      }
      if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getDataset: builder.query<JSONObject, DiversityRequestParams>({
      query: ({ dataset }: DiversityRequestParams) => {
        return `${GEN3_API}/api/statistics/diversity?dataset=${dataset}`;
      },
    }),
  }),
});

export const diversityReducer: Reducer = diversityApi.reducer as Reducer;
export const diversityMiddleware = diversityApi.middleware as Middleware;
