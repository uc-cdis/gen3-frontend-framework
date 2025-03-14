import * as React from 'react';
import {
  createDispatchHook,
  createStoreHook,
  ReactReduxContextValue,
  useSelector,
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
import { combineReducers, configureStore, Reducer } from '@reduxjs/toolkit';
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
  additionalReducers?: Reducer,
  baseQuery?: BaseQueryFn,
) => {
  const appContext = React.createContext<ReactReduxContextValue | null>(null);

  type AppState = any;
  const useAppSelector = useSelector.withTypes<AppState>();
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

  const reducers = combineReducers({
    [appRTKQApi.reducerPath]: appRTKQApi.reducer,
    ...additionalReducers,
  });
  const appStore = configureStore({
    reducer: reducers,
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
    appReducers: reducers,
  };
};
