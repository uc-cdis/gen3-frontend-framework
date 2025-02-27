// import all the components from this directory
import {
  type Cohort,
  cohortReducer,
  selectCohortFilters,
  selectIndexFilters,
  selectIndexedFilterByName,
  selectCurrentCohortId,
  selectCurrentCohortName,
  selectCurrentCohort,
  updateCohortFilter,
  setCohortFilter,
  setCohortIndexFilters,
  removeCohortFilter,
  clearCohortFilters,
  addNewDefaultUnsavedCohort,
  removeCohort,
  setActiveCohort,
  setActiveCohortList,
} from './cohortSlice';

import {
  saveCohort,
  loadCohortById,
  getCohortList,
  deleteCohort,
  findCohortByName,
  deleteAllCohorts,
} from './cohortPersistenceService';

import {
  persistCohort,
  persistCurrentCohort,
} from './cohortPersistenceActions';

import {
  toggleCohortBuilderCategoryFilter,
  toggleCohortBuilderAllFilters,
  selectCohortFilterExpanded,
  selectAllCohortFiltersCollapsed,
} from './filterExpandSlice';

import {
  setSharedFilters,
  setShouldShareFilters,
  selectShouldShareFilters,
  selectSharedFilters,
  selectSharedFiltersForFields,
} from './sharedFiltersSlice';
import { type CombineMode } from './types';

import {
  setCohortFilterCombineMode,
  selectCohortFilterCombineMode,
} from './filterCombineModeSlice';

export {
  selectCohortFilters,
  selectIndexFilters,
  selectIndexedFilterByName,
  selectCurrentCohortId,
  selectCurrentCohortName,
  selectCurrentCohort,
  selectCohortFilterExpanded,
  selectAllCohortFiltersCollapsed,
  selectCohortFilterCombineMode,
  selectShouldShareFilters,
  selectSharedFilters,
  selectSharedFiltersForFields,
  updateCohortFilter,
  setCohortFilter,
  setCohortIndexFilters,
  removeCohortFilter,
  clearCohortFilters,
  toggleCohortBuilderCategoryFilter,
  toggleCohortBuilderAllFilters,
  setCohortFilterCombineMode,
  setSharedFilters,
  setShouldShareFilters,
  type CombineMode,

export {
  type Cohort,
  selectCohortFilters,
  selectIndexFilters,
  selectIndexedFilterByName,
  selectCurrentCohortId,
  selectCurrentCohortName,
  selectCurrentCohort,
  selectAvailableCohorts,
  selectCurrentCohortModified,
  selectCurrentCohortSaved,
  cohortReducer,
  updateCohortFilter,
  setCohortFilter,
  setCohortIndexFilters,
  removeCohortFilter,
  clearCohortFilters,
  addNewDefaultUnsavedCohort,
  removeCohort,
  setActiveCohort,
  setActiveCohortList,
  saveCohort,
  loadCohortById,
  getCohortList,
  deleteCohort,
  findCohortByName,
  deleteAllCohorts,
  persistCohort,
  persistCurrentCohort,
};
