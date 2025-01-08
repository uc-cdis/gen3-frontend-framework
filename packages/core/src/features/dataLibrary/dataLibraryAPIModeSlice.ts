import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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
