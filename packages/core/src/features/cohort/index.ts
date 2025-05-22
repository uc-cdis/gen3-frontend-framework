// import all the components from this directory
import {
  cohortReducer,
  selectCohortFilters,
  selectIndexFilters,
  selectIndexedFilterByName,
  selectCurrentCohortId,
  selectCurrentCohortName,
  selectCurrentCohort,
  selectAvailableCohorts,
  selectCurrentCohortModified,
  selectCurrentCohortSaved,
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

import { CohortPersistence } from './cohortPersistence';

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
import { Cohort, type CombineMode } from './types';

import {
  useSavePersistedCohort,
  useGetPersistedCohortById,
  useGetAllPersistedCohorts,
  useDeletePersistedCohort,
  useUpdatePersistedCohort,
} from './cohortPersistenceHooks';

import {
  setCohortFilterCombineMode,
  selectCohortFilterCombineMode,
} from './filterCombineModeSlice';

export {
  type Cohort,
  type CombineMode,
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
  addNewDefaultUnsavedCohort,
  removeCohort,
  setActiveCohort,
  setActiveCohortList,
  toggleCohortBuilderCategoryFilter,
  toggleCohortBuilderAllFilters,
  setCohortFilterCombineMode,
  setSharedFilters,
  setShouldShareFilters,
  CohortPersistence,
  useSavePersistedCohort,
  useGetPersistedCohortById,
  useGetAllPersistedCohorts,
  useDeletePersistedCohort,
  useUpdatePersistedCohort,
};
