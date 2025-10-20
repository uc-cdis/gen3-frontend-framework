import type { CoreState } from '../../reducers';
import { Cohort, CohortId } from './types';
import {
  EmptyFilterSet,
  FilterSet,
  IndexedFilterSet,
  Operation,
} from '../filters';
import { cohortsAdapter, cohortSelectors } from './cohortManagerSlice';

export const {
  selectAll: selectAllCohorts,
  selectTotal: selectTotalCohorts,
  selectById: selectCohortById,
  selectIds: selectCohortIds,
} = cohortsAdapter.getSelectors(
  (state: CoreState) => state.cohorts.cohortManager,
);

/**
 * Internally used selector for the exported selectora
 * @param state
 */
const getCurrentCohortFromCoreState = (state: CoreState): CohortId => {
  return state.cohorts.cohortManager.currentCohortId;
};
export const selectCohortFilters = (state: CoreState): IndexedFilterSet => {
  const currentCohortId = getCurrentCohortFromCoreState(state);
  return state.cohorts.cohortManager.entities[currentCohortId]?.filters;
};
export const selectCurrentCohortFilters = (
  state: CoreState,
): IndexedFilterSet => {
  const currentCohortId = getCurrentCohortFromCoreState(state);
  return state.cohorts.cohortManager.entities[currentCohortId]?.filters;
};
export const selectCurrentCohortId = (state: CoreState): CohortId => {
  return state.cohorts.cohortManager.currentCohortId;
};
export const selectCurrentCohort = (state: CoreState): Cohort =>
  cohortSelectors.selectById(state, getCurrentCohortFromCoreState(state));
export const selectCurrentCohortName = (state: CoreState): string =>
  cohortSelectors.selectById(state, getCurrentCohortFromCoreState(state)).name;
/**
 * Select a filter by its name from the current cohort. If the filter is not found
 * returns undefined.
 * @param state - Core
 * @param index which cohort index to select from
 * @param name name of the filter to select
 */
export const selectIndexedFilterByName = (
  state: CoreState,
  index: string,
  name: string,
): Operation | undefined => {
  return cohortSelectors.selectById(state, getCurrentCohortFromCoreState(state))
    .filters[index]?.root[name];
};
/**
 * Returns the cohort's name given the id
 * @param state - the CoreState
 * @param cohortId - the cohort id
 * @category Cohort
 * @category Selectors
 */
export const selectCohortNameById = (
  state: CoreState,
  cohortId: string,
): string | undefined => {
  const cohort = cohortSelectors.selectById(state, cohortId);
  return cohort?.name;
};

/**
 * Returns all the cohorts in the state
 * @param state - the CoreState
 *
 * @category Cohort
 * @category Selectors
 */

export const selectAvailableCohorts = (state: CoreState): Cohort[] =>
  cohortSelectors.selectAll(state);
/**
 * Returns if the current cohort is modified
 * @param state - the CoreState
 * @category Cohort
 * @category Selectors
 * @hidden
 */
export const selectCurrentCohortModified = (
  state: CoreState,
): boolean | undefined => {
  const cohort = cohortSelectors.selectById(
    state,
    getCurrentCohortFromCoreState(state),
  );
  return cohort?.modified;
};
/**
 * Returns if the current cohort has been saved
 * @param state - the CoreState
 * @category Cohort
 * @category Selectors
 * @hidden
 */
export const selectCurrentCohortSaved = (
  state: CoreState,
): boolean | undefined => {
  const cohort = cohortSelectors.selectById(
    state,
    getCurrentCohortFromCoreState(state),
  );
  return cohort?.saved;
};
/**
 * Select a filter by its name from the current cohort. If the filter is not found
 * returns undefined.
 * @param state - Core
 * @param name name of the filter to select
 */
export const selectAvailableCohortByName = (
  state: CoreState,
  name: string,
): Cohort | undefined =>
  cohortSelectors
    .selectAll(state)
    .find((cohort: Cohort) => cohort.name === name);
/**
 * Select a filter from the index.
 * returns undefined.
 * @param state - Core
 * @param index which cohort index to select from
 */
export const selectIndexFilters = (
  state: CoreState,
  index: string,
): FilterSet => {
  const cohort = cohortSelectors.selectById(
    state,
    getCurrentCohortFromCoreState(state),
  );
  if (!cohort) {
    console.error('No Cohort Defined');
  }
  return cohort?.filters?.[index] ?? EmptyFilterSet;
};
