import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

export interface DataLibraryAPIModeState {
  useRestAPI: boolean;
}

const initialState = {
  useRestAPI: false,
};

const DataLibraryAPIModeSlice = createSlice({
  name: 'DataLibraryAPIMode',
  initialState,
  reducers: {
    setDataLibraryAPIMode: (state, action: PayloadAction<boolean>) => {
      state.useRestAPI = action.payload;
    },
  },
});

export const { setDataLibraryAPIMode } = DataLibraryAPIModeSlice.actions;

export const setDataLibraryAPIModeReducer = DataLibraryAPIModeSlice.reducer;

export const selectDataLibraryAPIModeSelector = (
  state: DataLibraryAPIModeState,
) => state.useRestAPI;

// Memoized selector for getting data library items for a specific root object
export const selectDataLibraryAPIMode = createSelector(
  [selectDataLibraryAPIModeSelector],
  (dataLibraryAPIMode) => dataLibraryAPIMode.useRestAPI,
);
