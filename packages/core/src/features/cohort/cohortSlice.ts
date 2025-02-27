import { createSlice, Draft, type PayloadAction } from '@reduxjs/toolkit';
import type { CoreState } from '../../reducers';
import { Operation, FilterSet, IndexedFilterSet } from '../filters';

export interface Cohort {
  readonly id: string;
  readonly name: string;
  readonly filters: IndexedFilterSet; // maps of index to filter set
  readonly modified?: boolean; // flag which is set to true if modified and unsaved
  readonly modified_datetime: string; // last time cohort was modified
}

export interface CohortState {
  cohort: Cohort;
}

export const EmptyCohort: Cohort = {
  id: 'default',
  name: 'Filters',
  filters: {},
  modified_datetime: new Date().toISOString(),
};

const initialCohortState: CohortState = {
  cohort: { ...EmptyCohort },
};

interface UpdateFilterParams {
  index: string;
  field: string;
  filter: Operation;
}

interface SetFilterParams {
  index: string;
  filters: FilterSet;
}

interface SetAllIndexFiltersParams {
  filters: IndexedFilterSet;
}

interface RemoveFilterParams {
  index: string;
  field: string;
}

interface ClearAllFilterParams {
  index: string;
}

// TODO: start using this adapter
/*
const cohortsAdapter = createEntityAdapter<Cohort>({
  sortComparer: (a, b) => {
    if (a.modified_datetime <= b.modified_datetime) return 1;
    else return -1;
  },
});
*/

/**
 * Redux slice for cohort filters
 */

export const cohortSlice = createSlice({
  name: 'cohort',
  initialState: initialCohortState,
  reducers: {
    // adds a filter to the cohort filter set at the given index
    updateCohortFilter: (
      state: Draft<CohortState>,
      action: PayloadAction<UpdateFilterParams>,
    ) => {
      const { index, field, filter } = action.payload;
      return {
        cohort: {
          ...state.cohort,
          filters: {
            ...state.cohort.filters,
            [index]: {
              mode: state.cohort.filters?.[index]?.mode ?? 'and',
              root: {
                ...(state.cohort.filters?.[index]?.root ?? {}),
                [field]: filter,
              },
            },
          },
        },
      };
    },
    setCohortFilter: (
      state: Draft<CohortState>,
      action: PayloadAction<SetFilterParams>,
    ) => {
      const { index, filters } = action.payload;
      return {
        cohort: {
          ...state.cohort,
          filters: {
            ...state.cohort.filters,
            [index]: filters,
          },
        },
      };
    },
    setCohortIndexFilters: (
      state: Draft<CohortState>,
      action: PayloadAction<SetAllIndexFiltersParams>,
    ) => {
      return {
        cohort: {
          ...state.cohort,
          filters: { ...action.payload.filters },
        },
      };
    },

    // removes a filter to the cohort filter set at the given index
    removeCohortFilter: (
      state: Draft<CohortState>,
      action: PayloadAction<RemoveFilterParams>,
    ) => {
      const { index, field } = action.payload;
      const filters = state.cohort?.filters?.[index]?.root;
      if (!filters) {
        return;
      }
      const { [field]: _a, ...updated } = filters;
      return {
        cohort: {
          ...state.cohort,
          filters: {
            ...state.cohort.filters,
            [index]: {
              mode: state.cohort.filters[index].mode,
              root: updated,
            },
          },
        },
      };
    },
    // removes all filters from the cohort filter set at the given index
    clearCohortFilters: (
      state: Draft<CohortState>,
      action: PayloadAction<ClearAllFilterParams>,
    ) => {
      const { index } = action.payload;
      return {
        cohort: {
          ...state.cohort,
          filters: {
            ...state.cohort.filters,
            [index]: {
              // empty filter set
              mode: 'and',
              root: {},
            } as FilterSet,
          },
        },
      };
    },
  },
});

// Filter actions: addFilter, removeFilter, updateFilter
export const {
  updateCohortFilter,
  setCohortFilter,
  setCohortIndexFilters,
  removeCohortFilter,
  clearCohortFilters,
} = cohortSlice.actions;

export const selectCohortFilters = (state: CoreState): IndexedFilterSet =>
  state.cohorts.cohort.cohort.filters;

export const selectCurrentCohortId = (state: CoreState): string =>
  state.cohorts.cohort.cohort.id;

export const selectCurrentCohort = (state: CoreState): Cohort =>
  state.cohorts.cohort.cohort;

export const selectCurrentCohortName = (state: CoreState): string =>
  state.cohorts.cohort.cohort.name;

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
  return state.cohorts.cohort.cohort.filters[index]?.root[name];
};

const EmptyFilterSet: FilterSet = { mode: 'and', root: {} };

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
  return state.cohorts.cohort.cohort.filters?.[index] ?? EmptyFilterSet; // TODO: check if this is undefined
};

export const cohortReducer = cohortSlice.reducer;
