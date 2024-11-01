import { FilterSet, IndexedFilterSet, Operation } from '@gen3/core';
import { Cohort } from './CohortSlice';
import { AppState } from './appApi';

export const selectCohortFilters = (state: AppState): IndexedFilterSet =>
  state.cohorts.cohort.filters;
export const selectCurrentCohortId = (state: AppState): string =>
  state.cohorts.cohort.id;
export const selectCurrentCohort = (state: AppState): Cohort =>
  state.cohorts.cohort;
export const selectCurrentCohortName = (state: AppState): string =>
  state.cohorts.cohort.name;
/**
 * Select a filter by its name from the current cohort. If the filter is not found
 * returns undefined.
 * @param state - Core
 * @param index which cohort index to select from
 * @param name name of the filter to select
 */
export const selectIndexedFilterByName = (
  state: AppState,
  index: string,
  name: string,
): Operation | undefined => {
  return state.cohorts.cohort.filters[index]?.root[name];
};
const EmptyFilterSet: FilterSet = { mode: 'and', root: {} };
/**
 * Select a filter from the index.
 * returns undefined.
 * @param state - Core
 * @param index which cohort index to select from
 */
export const selectIndexFilters = (
  state: AppState,
  index: string,
): FilterSet => {
  return state.cohorts.cohort.filters?.[index] ?? EmptyFilterSet; // TODO: check if this is undefined
};
