import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CoreState } from '../../reducers';

const initialState: { datetimeCache: Record<string, number> } = {
  datetimeCache: {},
};

const sowerJobDatetimeSlice = createSlice({
  name: 'sowerJobDatetime',
  initialState,
  reducers: {
    setSowerJobDatetime: (state, action: PayloadAction<string>) => {
      return {
        datetimeCache: { ...state.datetimeCache, [action.payload]: Date.now() },
      };
    },
  },
});

export const { setSowerJobDatetime } = sowerJobDatetimeSlice.actions;
export const selectSowerJobDatetimeCache = (state: CoreState) =>
  state.sower.sowerJobDatetime.datetimeCache;
export const sowerJobDatetimeReducer = sowerJobDatetimeSlice.reducer;
