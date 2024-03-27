import { createSelector, Middleware, Reducer } from '@reduxjs/toolkit';
import { coreCreateApi } from '../../api';
import { fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { GEN3_API } from '../../constants';
import { CoreState } from '../../reducers';
import { JSONObject } from '../../types';
import { getCookie } from 'cookies-next';

export interface CSRFToken {
  readonly csrfToken: string;
}

/**
 * Creates a base class core API for building other API endpoints on top of.
 * @param reducerPath - The root key name that the other slices will be derived from
 * @param baseQuery: - The template query which the slices will addon to
 * @param endpoints - Base API endpoints that should exist in every slice
 * @returns: The generated base API
 */
export const gen3Api = coreCreateApi({
  reducerPath: 'gen3Services',
  baseQuery: fetchBaseQuery({
    baseUrl: `${GEN3_API}`,
    prepareHeaders: (headers, { getState }) => {
      const csrfToken = selectCSRFToken(getState() as CoreState);
      headers.set('Content-Type', 'application/json');

      let accessToken = undefined;
      if (process.env.NODE_ENV === 'development') {
        accessToken = getCookie('access_token');
      }
      if (csrfToken) headers.set('X-CSRFToken', csrfToken);
      if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getCSRF: builder.query<CSRFToken, void>({
      query: () => '_status',
      transformResponse: (response: JSONObject): CSRFToken => {
        return { csrfToken: response['csrf'] as string };
      },
    }),
  }),
});

export const gen3ServicesReducer: Reducer = gen3Api.reducer as Reducer;
export const gen3ServicesReducerMiddleware = gen3Api.middleware as Middleware;

export const { useGetCSRFQuery } = gen3Api;

export const selectCSRFTokenData = gen3Api.endpoints.getCSRF.select();

const passThroughTheState = (state: CoreState) => state.gen3Services;

export const selectCSRFToken = createSelector(
  [selectCSRFTokenData, passThroughTheState],
  (state) => state?.data?.csrfToken,
);



export const selectHeadersWithCSRFToken = createSelector(
  [selectCSRFToken, passThroughTheState],
  (csrfToken) => ({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
  }),
);
