import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CoreState } from '../../reducers';

const sowerJobDatetimeSlice = createSlice({
  name: 'sowerJobDatetime',
  initialState: {},
  reducers: {
    setSowerJobDatetime: (state, action: PayloadAction<string>) => {
      return { ...state, [action.payload]: Date.now() };
    },
  },
});

export const { setSowerJobDatetime } = sowerJobDatetimeSlice.actions;
export const selectSowerJobDatetimeCache = (state: CoreState) =>
  state.sower.sowerJobDatetime;
export const sowerJobDatetimeReducer = sowerJobDatetimeSlice.reducer;
