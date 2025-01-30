import { Middleware, Reducer } from '@reduxjs/toolkit';
import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';
import { GEN3_API } from '../../constants';
import { CoreState } from '../../reducers';
import { selectCSRFToken } from '../user/userSliceRTK';
import { getCookie } from 'cookies-next';

/**
 * Creates a base class core API for building other API endpoints on top of.
 * @param reducerPath - The root key name that the other slices will be derived from
 * @param baseQuery: - The template query which the slices will addon to
 * @param endpoints - Base API endpoints that should exist in every slice
 * @returns: The generated base API
 */
export const gen3Api = createApi({
  reducerPath: 'gen3Services',
  baseQuery: fetchBaseQuery({
    baseUrl: `${GEN3_API}`,
    prepareHeaders: (headers, { getState }) => {
      const csrfToken = selectCSRFToken(getState() as CoreState);
      headers.set('Content-Type', 'application/json');
      if (process.env.NODE_ENV === 'development') {
        // NOTE: This cookie can only be accessed from the client side
        // in development mode. Otherwise, the cookie is set as httpOnly
        const accessToken = getCookie('credentials_token');
        if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
      }
      if (csrfToken) headers.set('X-CSRF-Token', csrfToken);

      return headers;
    },
  }),
  endpoints: () => ({}),
});

export const gen3ServicesReducer: Reducer = gen3Api.reducer as Reducer;
export const gen3ServicesReducerMiddleware = gen3Api.middleware as Middleware;
