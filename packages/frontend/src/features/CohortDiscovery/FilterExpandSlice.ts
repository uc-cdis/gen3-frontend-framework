import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState } from './appApi';

type ExpandedFiltersState = Record<string, boolean>;

const initialState: ExpandedFiltersState = {};

const expandSlice = createSlice({
  name: 'CohortDiscovery/filterExpand',
  initialState: initialState,
  reducers: {
    toggleCategoryFilter: (
      state,
      action: PayloadAction<{ field: string; expanded: boolean }>,
    ) => {
      return {
        ...state,
        [action.payload.field]: action.payload.expanded,
      };
    },
    toggleAllFilters: (state, action: PayloadAction<boolean>) => {
      return Object.fromEntries(
        Object.keys(state).map((k) => [k, action.payload]),
      );
    },
  },
});

export const filtersExpandedReducer = expandSlice.reducer;

export const { toggleCategoryFilter, toggleAllFilters } = expandSlice.actions;

export const selectFilterExpanded = (state: AppState, field: string): boolean =>
  state.filtersExpandedState?.[field];

export const selectAllFiltersCollapsed = (state: AppState): boolean =>
  Object.values(state.filtersExpandedState).every((e) => !e);
