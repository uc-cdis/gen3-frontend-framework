// import all the components from this directory
import {
  cohortReducer,
  selectCurrentCohortFilters,
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

import {
  useSetActiveCohort,
  useDeleteCohort,
  useAddUnsavedCohort,
  useDiscardChanges,
  useCohortFacetFilters,
} from './cohortSliceHooks';

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
  type CohortPersistenceSaveReplaceParameters,
} from './types';

import {
  useSavePersistedCohort,
  useReplaceExistingPersistedCohort,
  useGetPersistedCohortById,
  useGetAllPersistedCohorts,
  useDeletePersistedCohort,
  useUpdatePersistedCohort,
  useGetAllCohortNames,
  type ReplacePersistedCohortResults,
  type SavePersistedCohortResult,
} from './cohortPersistenceHooks';

import {
  setCohortFilterCombineMode,
  selectCohortFilterCombineMode,
} from './filterCombineModeSlice';

export {
  type Cohort,
  type CombineMode,
  type CohortPersistenceSaveReplaceParameters,
  type ReplacePersistedCohortResults,
  type SavePersistedCohortResult,
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
  useSetActiveCohort,
  useDeleteCohort,
  useAddUnsavedCohort,
  useDiscardChanges,
  useCohortFacetFilters,
};
