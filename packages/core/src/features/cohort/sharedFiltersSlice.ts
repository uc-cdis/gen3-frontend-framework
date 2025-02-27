import { createSlice, Draft, type PayloadAction } from '@reduxjs/toolkit';
import type { CoreState } from '../../reducers';
import { IndexAndField, SharedFieldMapping } from '../guppy';

export interface SharedFiltersState {
  shouldShareFilters: boolean; // if set filters will be added to all indexes when changed
  sharedFiltersMap: SharedFieldMapping; // mapping of shared filters
}

const initialState: SharedFiltersState = {
  shouldShareFilters: false,
  sharedFiltersMap: {},
};

export const cohortSharedFiltersSlice = createSlice({
  name: 'cohortSharedFilters',
  initialState: initialState,
  reducers: {
    setShouldShareFilters: (
      state: Draft<SharedFiltersState>,
      action: PayloadAction<boolean>,
    ) => {
      state.shouldShareFilters = action.payload;
      return state;
    },
    setSharedFilters: (
      state: Draft<SharedFiltersState>,
      action: PayloadAction<SharedFieldMapping>,
    ) => {
      state.sharedFiltersMap = action.payload;
    },
  },
});

export const selectShouldShareFilters = (state: CoreState): boolean =>
  state.cohorts.sharedFilters.shouldShareFilters;

export const selectSharedFilters = (state: CoreState): SharedFieldMapping =>
  state.cohorts.sharedFilters.sharedFiltersMap;

export const selectSharedFiltersForFields = (
  state: CoreState,
  field: string,
): Array<IndexAndField> =>
  state.cohorts.sharedFilters.sharedFiltersMap?.[field] ?? [field];

export const { setShouldShareFilters, setSharedFilters } =
  cohortSharedFiltersSlice.actions;

export const cohortSharedFiltersReducer = cohortSharedFiltersSlice.reducer;
