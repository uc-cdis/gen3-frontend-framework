import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { CoreState, rootReducer } from './reducers';
import { gen3ServicesReducerMiddleware } from './features/gen3/gen3Api';
import { guppyAPISliceMiddleware } from './features/guppy/guppyApi';
import { userAuthApiMiddleware } from './features/user/userSliceRTK';
import {
  persistReducer,
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';

import type { Action, Reducer } from 'redux';
import type { PersistConfig, PersistState } from 'redux-persist';

/**
 * Update declaration of persistReducer to support redux v5
 */
declare module 'redux-persist' {
  export function persistReducer<S, A extends Action = Action, P = S>(
    config: PersistConfig<S>,
    baseReducer: Reducer<S, A, P>,
  ): Reducer<
    S & { _persist: PersistState },
    A,
    P & { _persist?: PersistState }
  >;
}

import storage from './storage-persist';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['cohorts', 'activeWorkspace'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const setupCoreStore = (preloadedState?: Partial<CoreState>) =>
  configureStore({
    reducer: persistedReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(
        gen3ServicesReducerMiddleware,
        guppyAPISliceMiddleware,
        userAuthApiMiddleware,
      ),
  });

export const coreStore = setupCoreStore();

setupListeners(coreStore.dispatch);

export type CoreDispatch = typeof coreStore.dispatch;
