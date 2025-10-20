import * as React from 'react';
import {
  createDispatchHook,
  createStoreHook,
  createSelectorHook,
  ReactReduxContextValue,
} from 'react-redux';
import {
  ApiModules,
  buildCreateApi,
  coreModule,
  CreateApi,
  reactHooksModule,
  BaseQueryFn,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';
import { configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import { GEN3_API } from '../../constants';
import { getCookie } from 'cookies-next';
import { v5 as uuidv5 } from 'uuid';
import { GEN3_APP_NAMESPACE } from './constants';

export const createAppApiForRTKQ = (
  reducerPath: string,
  name: string,
  version: string,
  additionalReducers?: (...args: any) => any,
  baseQuery?: BaseQueryFn,
) => {
  const nameVersion = `${name}::${version}`;
  const id = uuidv5(nameVersion, GEN3_APP_NAMESPACE);

  const appContext = React.createContext<ReactReduxContextValue | null>(null);
  const useAppSelector = createSelectorHook(appContext);
  const useAppDispatch = createDispatchHook(appContext);
  const useAppStore = createStoreHook(appContext);

  const appCreateApi: CreateApi<keyof ApiModules<any, any, any, any>> =
    buildCreateApi(
      coreModule(),
      reactHooksModule({
        hooks: {
          useDispatch: useAppDispatch,
          useSelector: useAppSelector,
          useStore: useAppStore,
        },
      }),
    );

  const appRTKQApi = appCreateApi({
    reducerPath: reducerPath,
    baseQuery:
      baseQuery ??
      fetchBaseQuery({
        baseUrl: `${GEN3_API}`,
        prepareHeaders: (headers) => {
          headers.set('Content-Type', 'application/json');
          if (process.env.NODE_ENV === 'development') {
            // NOTE: This cookie can only be accessed from the client side
            // in development mode. Otherwise, the cookie is set as httpOnly
            const accessToken = getCookie('credentials_token');
            if (accessToken)
              headers.set('Authorization', `Bearer ${accessToken}`);
          }

          return headers;
        },
      }),
    endpoints: () => ({}),
  });

  const appMiddleware = appRTKQApi.middleware;
  const appStore = configureStore({
    devTools: {
      name: `${nameVersion}::${id}`,
    },
    reducer: {
      [appRTKQApi.reducerPath]: appRTKQApi.reducer,
      ...additionalReducers,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(appMiddleware),
  });

  return {
    useAppSelector: useAppSelector,
    useAppDispatch: useAppDispatch,
    useAppStore: useAppStore,
    AppContext: appContext,
    appApi: appRTKQApi,
    appContext: appContext,
    appStore: appStore,
  };
};
