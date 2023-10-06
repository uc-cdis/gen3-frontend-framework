import { Middleware, Reducer } from '@reduxjs/toolkit';
import { coreCreateApi } from '../../api';
import { fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { GEN3_GUPPY_API } from '../../constants';

export const guppyApi = coreCreateApi({
  reducerPath: 'guppyApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${GEN3_GUPPY_API}`,
    prepareHeaders: (headers) => {
      headers.set('Access-Control-Allow-Origin', '*');
      return headers;
    },
  }),
  endpoints: () => ({}),
});

export const gen3ServicesReducerPath: string = guppyApi.reducerPath;
export const gen3ServicesReducer: Reducer = guppyApi.reducer as Reducer;
export const gen3ServicesReducerMiddleware = guppyApi.middleware as Middleware;
