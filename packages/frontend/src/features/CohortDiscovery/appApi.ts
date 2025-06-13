import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import { createAppStore } from '@gen3/core';
import { filtersExpandedReducer } from './FilterExpandSlice';
import { selectedFacetsReducer } from './SelectedFacetsSlice';
import { facetDefinitionsReducer } from './FacetDefinitionsSlice';

import storage from './storage-persist';
import { saveCohortPersistenceReducer } from './SavedCohortManagerSlice';
import { dataAccessRequestsReducer } from './RequestManagerSlice';

import type { Action, Reducer } from 'redux';
import type { PersistConfig, PersistState } from 'redux-persist';

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

const _APP_NAME = 'CohortDiscovery';

const persistConfig = {
  key: _APP_NAME,
  version: 1,
  storage,
};

// create the store, context and selector for the ProjectsCenter
// Note the project app has a local store and context which isolates
// the filters and other store/cache values

const reducers = combineReducers({
  selectedIndexFacets: selectedFacetsReducer,
  filtersExpandedState: filtersExpandedReducer,
  facetDefinitionState: facetDefinitionsReducer,
  // cohorts: cohortReducer,
  savedCohorts: saveCohortPersistenceReducer,
  dataAccessRequests: dataAccessRequestsReducer,
});

const persistedReducers = persistReducer(persistConfig, reducers);

export const { id, AppStore, AppContext, useAppSelector, useAppDispatch } =
  createAppStore({
    reducers: persistedReducers,
    name: _APP_NAME,
    version: '0.0.1',
  });

export type AppState = ReturnType<typeof persistedReducers>;
