import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState } from './appApi';

type SelectedIndexFilters = Record<string, string[]>;

const initialState: SelectedIndexFilters = {};

const selectIndexFacets = createSlice({
  name: 'CohortDiscovery/selectedFacets',
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
      if (!(action.payload.index in state)) return state;

      return {
        ...state,
        ...{
          [action.payload.index]: state[action.payload.index].filter(
            (x) => x != action.payload.field,
          ),
        },
      };
    },
  },
});

export const selectedFacetsReducer = selectIndexFacets.reducer;

export const { addFacetSelection, removeFacetSelection } =
  selectIndexFacets.actions;

export const selectSelectedFacetsFromIndex = (
  state: AppState,
  index: string,
): string[] => state.selectedIndexFacets[index];
