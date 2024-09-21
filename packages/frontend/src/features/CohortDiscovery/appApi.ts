import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { createAppStore } from '@gen3/core';
import { filtersExpandedReducer } from './FilterExpandSlice';
import { selectedFacetsReducer } from './SelectedFacetsSlice';

const _APP_NAME = 'CohortDiscovery';

const persistConfig = {
  key: _APP_NAME,
  version: 1,
  storage,
  whitelist: ['filterExpandState'],
};

// create the store, context and selector for the ProjectsCenter
// Note the project app has a local store and context which isolates
// the filters and other store/cache values

const reducers = combineReducers({
  selectedIndexFacets: selectedFacetsReducer,
  filtersExpandedState: filtersExpandedReducer,
});

export const { id, AppStore, AppContext, useAppSelector, useAppDispatch } =
  createAppStore({
    reducers: persistReducer(persistConfig, reducers),
    name: _APP_NAME,
    version: '0.0.1',
  });

export type AppState = ReturnType<typeof reducers>;
