import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import { createAppStore } from '@gen3/core';
import { filtersExpandedReducer } from './FilterExpandSlice';
import { selectedFacetsReducer } from './SelectedFacetsSlice';
import { facetDefinitionsReducer } from './FacetDefinitionsSlice';
import { cohortReducer } from './CohortSlice';

import storage from './storage-persist';

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
  cohorts: cohortReducer,
});

const persistedReducers = persistReducer(persistConfig, reducers);

export const { id, AppStore, AppContext, useAppSelector, useAppDispatch } =
  createAppStore({
    reducers: persistedReducers,
    name: _APP_NAME,
    version: '0.0.1',
  });

export type AppState = ReturnType<typeof persistedReducers>;
