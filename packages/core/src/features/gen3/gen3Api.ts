import { createSelector, Middleware, Reducer } from '@reduxjs/toolkit';
import { coreCreateApi } from '../../api';
import { fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { GEN3_DOMAIN } from '../../constants';
import { CoreState } from '../../reducers';
import { JSONObject } from '../../types';

export interface CSRFToken {
  readonly csrfToken: string;
}

export const gen3Api = coreCreateApi({
  reducerPath: 'gen3Services',
  baseQuery: fetchBaseQuery({
    baseUrl: `${GEN3_DOMAIN}`,
    prepareHeaders: (headers, { getState }) => {
      const csrfToken = selectCSRFToken(getState() as CoreState);
      if (csrfToken) {
        headers.set('X-CSRFToken', csrfToken);
      }
      headers.set('Access-Control-Allow-Origin', '*');
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
  })
);
