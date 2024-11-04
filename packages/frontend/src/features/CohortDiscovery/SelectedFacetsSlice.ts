import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState } from './appApi';

type SelectedIndexFilters = Record<string, string[]>;

const initialState: SelectedIndexFilters = {};

const selectIndexFacets = createSlice({
  name: 'CohortDiscovery/filterExpand',
  initialState: initialState,
  reducers: {
    addFacetSelection: (
      state,
      action: PayloadAction<{ index: string; field: string }>,
    ) => {
      if (!(action.payload.index in state)) {
        return {
          ...state,
          ...{ [action.payload.index]: [action.payload.field] },
        };
      } else
        return {
          ...state,
          [action.payload.index]: [
            ...state[action.payload.index],
            action.payload.field,
          ],
        };
    },
    removeFacetSelection: (
      state,
      action: PayloadAction<{ index: string; field: string }>,
    ) => {
      if (!(action.payload.index in state[action.payload.index])) return state;
      if (action.payload.field in state[action.payload.index]) {
        return {
          ...state,
          ...{
            [action.payload.index]: state[action.payload.index].filter(
              (x) => x !== action.payload.field,
            ),
          },
        };
      }
    },
  },
});

export const selectedFacetsReducer = selectIndexFacets.reducer;

export const { addFacetSelection, removeFacetSelection } =
  selectIndexFacets.actions;

export const selectSelectedFacetsFromIndex = (
  state: AppState,
  index: string,
  field: string,
): boolean => state.filtersExpandedState?.[field];

export const selectAllFiltersCollapsed = (state: AppState): boolean =>
  Object.values(state.filtersExpandedState).every((e) => !e);
