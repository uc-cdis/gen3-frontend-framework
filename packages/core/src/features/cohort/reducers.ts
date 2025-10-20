import { combineReducers } from '@reduxjs/toolkit';
import { cohortReducer } from './cohortManagerSlice';
import { cohortBuilderFiltersExpandedReducer } from './filterExpandSlice';
import { cohortBuilderFiltersCombineModeReducer } from './filterCombineModeSlice';
import { cohortSharedFiltersReducer } from './sharedFiltersSlice';

export const cohortReducers = combineReducers({
  filtersExpanded: cohortBuilderFiltersExpandedReducer,
  filtersCombineMode: cohortBuilderFiltersCombineModeReducer,
  sharedFilters: cohortSharedFiltersReducer,
  cohortManager: cohortReducer,
});
