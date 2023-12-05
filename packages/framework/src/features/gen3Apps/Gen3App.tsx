import React, { ComponentType, useEffect } from 'react';
import { coreStore } from '../../store';
import { v5 as uuidv5 } from 'uuid';
import { addGen3AppMetadata, EntityType } from './gen3AppsSlice';
import { configureStore, AnyAction } from '@reduxjs/toolkit';
import { Store, Action } from 'redux';
import {
  Provider,
  ReactReduxContextValue,
  TypedUseSelectorHook,
  createSelectorHook,
  createDispatchHook,
  createStoreHook,
} from 'react-redux';
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { registerGen3App } from './gen3AppRegistry';
import { DataStatus } from '../../dataAccess';
import { CookiesProvider } from 'react-cookie';

// using a random uuid v4 as the namespace
const GEN3_APP_NAMESPACE = '7bfaa818-c69c-457e-8d87-413cf60c25f0';

export interface CreateGen3AppOptions {
  readonly App: ComponentType;
  readonly name: string;
  readonly version: string;
  readonly requiredEntityTypes: ReadonlyArray<EntityType>;
}

export const getGen3AppId = (name: string, version: string): string => {
  const nameVersion = `${name}::${version}`;
  return uuidv5(nameVersion, GEN3_APP_NAMESPACE);
};

export const createGen3App = ({
  App,
  name,
  version,
  requiredEntityTypes,
}: CreateGen3AppOptions): React.FC => {
  // create a stable id for this app
  const nameVersion = `${name}::${version}`;
  const id = uuidv5(nameVersion, GEN3_APP_NAMESPACE);

  // need to create store and provider.
  // return a component representing this app
  // if component gets added to a list, then the list can be iterated in index.js and each provider component can be added
  // a route can be setup for the app

  // need to register its name, category, path, data requirements
  // this will be used to build page3
  // click app link
  const store = configureStore({
    // TODO allow user to pass in a reducer in CreateGen3AppOptions?
    reducer: (state) => state,
    devTools: {
      name: `${nameVersion}::${id}`,
    },
  });

  const Gen3AppWrapper: React.FC = () => {
    useEffect(() => {
      document.title = `GEN3 - ${name}`;
    });

    return (
      <Provider store={store}>
        <CookiesProvider>
          <App />
        </CookiesProvider>
      </Provider>
    );
  };

  // add the app to the store
  coreStore.dispatch(
    addGen3AppMetadata({
      id,
      name,
      version,
      requiredEntityTypes,
    }),
  );
  registerGen3App(id, Gen3AppWrapper as unknown as React.ReactNode);

  return Gen3AppWrapper;
};

export interface AppDataSelectorResponse<T> {
  readonly data?: T;
  readonly status: DataStatus;
  readonly error?: string;
}

export interface UseAppDataResponse<T> {
  readonly data?: T;
  readonly error?: string;
  readonly isUninitialized: boolean;
  readonly isFetching: boolean;
  readonly isSuccess: boolean;
  readonly isError: boolean;
}

export interface UseAppDataHook<P, T> {
  (...params: P[]): UseAppDataResponse<T>;
}

export interface CreateGEN3AppStore {
  readonly name: string;
  readonly version: string;
  readonly reducers: (...args: any) => any;
}

// ----------------------------------------------------------------------------------------
// Apps with Local Storage
//

export const createAppStore = (
  options: CreateGEN3AppStore,
): Record<any, any> => {
  const { name, version, reducers } = options;
  const nameVersion = `${name}::${version}`;
  const id = uuidv5(nameVersion, GEN3_APP_NAMESPACE);

  const store = configureStore({
    reducer: reducers,
    devTools: {
      name: `${nameVersion}::${id}`,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });
  type AppState = ReturnType<typeof reducers>;
  const context = React.createContext(
    undefined as unknown as ReactReduxContextValue<AppState, AnyAction>,
  );

  type AppDispatch = typeof store.dispatch;
  const useAppSelector: TypedUseSelectorHook<AppState> =
    createSelectorHook(context);
  const useAppDispatch: () => AppDispatch = createDispatchHook(context);
  const useAppStore = createStoreHook(context);

  return {
    id: id,
    AppStore: store,
    AppContext: context,
    useAppSelector: useAppSelector,
    useAppDispatch: useAppDispatch,
    useAppStore: useAppStore,
  };
};

export interface CreateGen3AppWithOwnStoreOptions<
  A extends Action = AnyAction,
  S = any,
> {
  readonly App: ComponentType;
  readonly id: string; // unique id for this app
  readonly name: string; // name of the app
  readonly version: string; // version of the app, should be unique
  readonly requiredEntityTypes: ReadonlyArray<EntityType>;
  readonly store: Store<S, A>; // the redux-store for this app
  readonly context: any;
}

export const createGen3AppWithOwnStore = <
  A extends Action = AnyAction,
  S = any,
>(
  options: CreateGen3AppWithOwnStoreOptions<A, S>,
): React.ReactNode => {
  const { App, id, name, version, requiredEntityTypes, store, context } =
    options;

  // need to create store and provider.
  // return a component representing this app
  // if component gets added to a list, then the list can be iterated in index.js and each provider component can be added
  // a route can be setup for the app

  // need to register its name, category, path, data requirements
  // this will be used to build page3
  // click app link

  const Gen3AppWrapper = (): React.ReactNode => {
    useEffect(() => {
      document.title = `GEN3 - ${name}`;
    });

    return (
      <Provider store={store} context={context}>
        <CookiesProvider>
          <App />
        </CookiesProvider>
      </Provider>
    );
  };

  // add the app to the store
  coreStore.dispatch(
    addGen3AppMetadata({
      id,
      name,
      version,
      requiredEntityTypes,
    }),
  );
  registerGen3App(id, Gen3AppWrapper as unknown as React.ReactNode);
  return Gen3AppWrapper as unknown as React.ReactNode;
};
