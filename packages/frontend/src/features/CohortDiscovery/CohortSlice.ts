import { createSlice, Draft, type PayloadAction } from '@reduxjs/toolkit';
import { FilterSet, IndexedFilterSet, Operation } from '@gen3/core';

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

const initialCohortState: CohortState = {
  cohort: {
    id: 'default',
    name: 'Filters',
    filters: {},
    modified_datetime: new Date().toISOString(),
  },
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

interface RemoveFilterParams {
  index: string;
  field: string;
}

interface ClearAllFilterParams {
  index: string;
}

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
  removeCohortFilter,
  clearCohortFilters,
} = cohortSlice.actions;

export const cohortReducer = cohortSlice.reducer;
