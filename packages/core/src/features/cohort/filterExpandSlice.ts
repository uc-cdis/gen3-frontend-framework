import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CoreState } from '../../reducers';

// TODO: after multiple cohort support is merged move this to CohortBuilder
type ExpandedFiltersState = Record<string, Record<string, boolean>>;

const initialState: ExpandedFiltersState = {};

const expandSlice = createSlice({
  name: 'CohortBuilder/filterExpand',
  initialState: initialState,
  reducers: {
    toggleCohortBuilderCategoryFilter: (
      state,
      action: PayloadAction<{
        index: string;
        field: string;
        expanded: boolean;
      }>,
    ) => {
      return {
        ...state,
        [action.payload.index]: {
          [action.payload.field]: action.payload.expanded,
        },
      };
    },
    toggleCohortBuilderAllFilters: (
      state,
      action: PayloadAction<{ index: string; expand: boolean }>,
    ) => {
      return {
        ...state,
        [action.payload.index]: Object.keys(state[action.payload.index]).reduce(
          (acc, k) => {
            acc[k] = action.payload.expand;
            return acc;
          },
          {} as Record<string, boolean>,
        ),
      };
    },
  },
});

export const cohortBuilderFiltersExpandedReducer = expandSlice.reducer;

export const {
  toggleCohortBuilderCategoryFilter,
  toggleCohortBuilderAllFilters,
} = expandSlice.actions;

export const selectCohortFilterExpanded = (
  state: CoreState,
  index: string,
  field: string,
): boolean => state.cohortFiltersExpanded?.[index]?.[field];

export const selectAllCohortFiltersCollapsed = (
  state: CoreState,
  index: string,
): boolean =>
  Object.values(state.cohortFiltersExpanded[index]).every((e) => !e);
