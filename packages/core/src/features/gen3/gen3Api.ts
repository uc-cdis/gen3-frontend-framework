import { Middleware, Reducer } from '@reduxjs/toolkit';
import { coreCreateApi } from '../../api';
import { fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { GEN3_DOMAIN } from '../../constants';
import { CoreState } from "../../reducers";
import { selectCSRFToken } from "../fence";

export const gen3Api = coreCreateApi({
  reducerPath: 'gen3Services',
  baseQuery: fetchBaseQuery({
    baseUrl: `${GEN3_DOMAIN}`,
    prepareHeaders: (headers,  { getState }) => {
      const csrfToken = selectCSRFToken(getState() as CoreState);
      if (csrfToken) {
        headers.set('X-CSRFToken', csrfToken);
      }
      headers.set('Access-Control-Allow-Origin', '*');
      return headers;
    },
  }),
  endpoints: () => ({}),
});

export const gen3ServicesReducer: Reducer = gen3Api.reducer as Reducer;
export const gen3ServicesReducerMiddleware = gen3Api.middleware as Middleware;
