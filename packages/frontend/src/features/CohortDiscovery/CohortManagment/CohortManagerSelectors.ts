import { createSelector } from '@reduxjs/toolkit';
import { CohortId } from '@gen3/core';
import { cohortsAdapter } from './CohortManagerSlice';
import { AppState } from '../appApi';
import { EmptyFilterSet } from './types';
import { DiscoveryCohort } from '../types';
import { UninitializeCohort } from '../constants';

// Selectors
export const {
  selectAll: selectAllCohorts,
  selectTotal: selectTotalCohorts,
  selectById: selectCohortById,
  selectIds: selectCohortIds,
} = cohortsAdapter.getSelectors((state: AppState) => state.cohorts);

export const selectCurrentCohortId = (state: AppState): string =>
  state.cohorts.currentCohortId;

export const selectCurrentCohort = (
  state: AppState,
): DiscoveryCohort | null => {
  const { currentCohortId, entities } = state.cohorts;
  const cohort = entities[currentCohortId];

  if (!cohort) {
    return null;
  }

  return cohort;
};

export const selectSavedCohorts = createSelector(
  [selectAllCohorts],
  (cohorts) => cohorts.filter((cohort) => cohort.saved),
);

export const selectUnsavedCohorts = createSelector(
  [selectAllCohorts],
  (cohorts) => cohorts.filter((cohort) => !cohort.saved),
);

export const selectModifiedUnsavedCohorts = createSelector(
  [selectAllCohorts],
  (cohorts) => cohorts.filter((cohort) => cohort.modified && !cohort.saved),
);

export const selectAutoSaveInProgress = createSelector(
  [(state: AppState) => Array.from(state.cohorts.autoSaveInProgress)],
  (autoSaveArray) => autoSaveArray,
);

export const selectCohortAutoSaveStatus = createSelector(
  [
    (state: AppState) => state.cohorts.autoSaveInProgress,
    (state, cohortId) => cohortId,
  ],
  (autoSaveArray, cohortId) => autoSaveArray.includes(cohortId),
);

export const selectCurrentCohortName = createSelector(
  [selectCurrentCohort],
  (cohort) => cohort?.name ?? 'No Cohort Defined',
);

export const selectCurrentCohortFilters = createSelector(
  [selectCurrentCohort],
  (cohort) => (cohort ? cohort.filters : UninitializeCohort.filters),
);

export const selectCurrentCohortIndexFilters = createSelector(
  [selectCurrentCohort, (state, index) => index],
  (cohort, index) => {
    return cohort?.filters?.[index] ?? EmptyFilterSet;
  },
);

export const selectCohortNameExists = createSelector(
  [selectAllCohorts, (state, name, excludeId) => ({ name, excludeId })],
  (cohorts, params) => {
    const trimmedName = params.name.trim().toLowerCase();
    return cohorts.some(
      (cohort) =>
        cohort.id !== params.excludeId &&
        cohort.name.trim().toLowerCase() === trimmedName,
    );
  },
);

export const selectCohortManagerLoading = (state: AppState): boolean =>
  state.cohorts.loading;

export const selectCohortManagerUninitialized = (state: AppState): boolean =>
  state.cohorts.uninitialized;

export const selectCohortManagerError = (state: AppState): string | null =>
  state.cohorts.error;

export const selectCohortIdToNameMap = createSelector(
  [selectAllCohorts],
  (cohorts) => {
    return cohorts.reduce<Record<CohortId, string>>((acc, cohort) => {
      acc[cohort.id] = cohort.name;
      return acc;
    }, {});
  },
);
