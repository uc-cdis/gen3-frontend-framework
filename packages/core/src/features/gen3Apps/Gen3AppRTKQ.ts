import * as React from 'react';
import {
  createDispatchHook,
  createSelectorHook,
  createStoreHook,
  ReactReduxContextValue,
  TypedUseSelectorHook,
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
import { configureStore, UnknownAction } from '@reduxjs/toolkit';
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

export const createAppApiForRTKQ = (
  reducerPath: string,
  baseQuery?: BaseQueryFn,
) => {
  const appContext = React.createContext(
    undefined as unknown as ReactReduxContextValue<any, UnknownAction>,
  );

  type AppState = any;
  const useAppSelector: TypedUseSelectorHook<AppState> =
    createSelectorHook(appContext);
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
          let accessToken = undefined;
          if (process.env.NODE_ENV === 'development') {
            // NOTE: This cookie can only be accessed from the client side
            // in development mode. Otherwise, the cookie is set as httpOnly
            accessToken = getCookie('credentials_token');
          }
          if (accessToken)
            headers.set('Authorization', `Bearer ${accessToken}`);
          return headers;
        },
      }),
    endpoints: () => ({}),
  });

  const appMiddleware = appRTKQApi.middleware;
  const appStore = configureStore({
    reducer: {
      [appRTKQApi.reducerPath]: appRTKQApi.reducer,
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
