import { combineReducers } from '@reduxjs/toolkit';
import { cohortReducer } from './cohortSlice';
import { cohortBuilderFiltersExpandedReducer } from './filterExpandSlice';
import { cohortBuilderFiltersCombineModeReducer } from './filterCombineModeSlice';

export const cohortReducers = combineReducers({
  filtersExpanded: cohortBuilderFiltersExpandedReducer,
  filtersCombineMode: cohortBuilderFiltersCombineModeReducer,
  cohort: cohortReducer,
});
