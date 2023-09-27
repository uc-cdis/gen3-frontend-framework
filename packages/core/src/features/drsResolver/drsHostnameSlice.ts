import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DRSHostnameMap = Record<string, string>;

const initialState = {};

const slice = createSlice({
  name: 'drsResolver',
  initialState,
  reducers: {
    setDRSHostnames: (_state, action: PayloadAction<DRSHostnameMap>) => {
      return action.payload;
    },
  },
});

export const drsHostnamesReducer = slice.reducer;

export const { setDRSHostnames } = slice.actions;
