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
import {
  Cohort,
  type CombineMode,
  type CohortPersistenceSaveUpdateParameters,
} from './types';

import {
  useSavePersistedCohort,
  useReplaceExistingPersistedCohort,
  useGetPersistedCohortById,
  useGetAllPersistedCohorts,
  useDeletePersistedCohort,
  useUpdatePersistedCohort,
  useGetAllCohortNames,
} from './cohortPersistenceHooks';

import {
  setCohortFilterCombineMode,
  selectCohortFilterCombineMode,
} from './filterCombineModeSlice';

export {
  type Cohort,
  type CombineMode,
  type CohortPersistenceSaveUpdateParameters,
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
  useReplaceExistingPersistedCohort,
  useGetPersistedCohortById,
  useGetAllPersistedCohorts,
  useDeletePersistedCohort,
  useUpdatePersistedCohort,
  useGetAllCohortNames,
};
