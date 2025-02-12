import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CoreState } from '../../reducers';
import { CombineMode } from './types';

type CombineModeFiltersState = Record<string, Record<string, CombineMode>>;

const initialState: CombineModeFiltersState = {};

const expandSlice = createSlice({
  name: 'CohortBuilder/filterCombineMode',
  initialState: initialState,
  reducers: {
    setCohortFilterCombineMode: (
      state,
      action: PayloadAction<{
        index: string;
        field: string;
        mode: CombineMode;
      }>,
    ) => {
      return {
        ...state,
        [action.payload.index]: {
          ...state[action.payload.index],
          [action.payload.field]: action.payload.mode,
        },
      };
    },
  },
});

export const cohortBuilderFiltersCombineModeReducer = expandSlice.reducer;

export const { setCohortFilterCombineMode } = expandSlice.actions;

export const selectCohortFilterCombineMode = (
  state: CoreState,
  index: string,
  field: string,
): CombineMode => state.cohort.filtersCombineMode?.[index]?.[field] ?? 'or';
