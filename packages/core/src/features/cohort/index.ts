// import all the components from this directory
import {
  clearCohortFilters,
  cohortReducer,
  createNewCohort,
  removeCohort,
  removeCohortFilter,
  setCohortFilter,
  setCohortIndexFilters,
  setCohortList,
  setCurrentCohortId,
  updateCohortFilter,
  updateCohortName,
} from './cohortManagerSlice';

import {
  selectAllCohortFiltersCollapsed,
  selectCohortFilterExpanded,
  toggleCohortBuilderAllFilters,
  toggleCohortBuilderCategoryFilter,
} from './filterExpandSlice';

import {
  selectSharedFilters,
  selectSharedFiltersForFields,
  selectShouldShareFilters,
  setSharedFilters,
  setShouldShareFilters,
} from './sharedFiltersSlice';
import {
  type Cohort,
  type CohortId,
  type CombineMode,
  type StorageEntity,
} from './types';

import {
  selectCohortFilterCombineMode,
  setCohortFilterCombineMode,
} from './filterCombineModeSlice';

import { CohortStorage } from './storage/CohortStorage';
import {
  selectAllCohorts,
  selectAvailableCohorts,
  selectCohortFilters,
  selectCurrentCohort,
  selectCurrentCohortFilters,
  selectCurrentCohortId,
  selectCurrentCohortModified,
  selectCurrentCohortName,
  selectCurrentCohortSaved,
  selectIndexedFilterByName,
  selectIndexFilters,
} from './cohortManagerSelector';

export * from './utils';

export {
  type Cohort,
  type CombineMode,
  type CohortId,
  type StorageEntity,
  CohortStorage,
  selectCohortFilters,
  selectCurrentCohortFilters,
  selectIndexFilters,
  selectIndexedFilterByName,
  selectCurrentCohortId,
  selectCurrentCohortName,
  selectCurrentCohort,
  selectAvailableCohorts,
  selectCurrentCohortModified,
  selectCurrentCohortSaved,
  cohortReducer,
  selectCohortFilterExpanded,
  selectAllCohortFiltersCollapsed,
  selectCohortFilterCombineMode,
  selectShouldShareFilters,
  selectSharedFilters,
  selectSharedFiltersForFields,
  selectAllCohorts,
  updateCohortFilter,
  setCohortFilter,
  setCohortIndexFilters,
  removeCohortFilter,
  clearCohortFilters,
  createNewCohort,
  removeCohort,
  toggleCohortBuilderCategoryFilter,
  toggleCohortBuilderAllFilters,
  setCohortFilterCombineMode,
  setSharedFilters,
  setShouldShareFilters,
  setCurrentCohortId,
  updateCohortName,
  setCohortList,
};
