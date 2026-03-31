import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CoreState } from '../../reducers';

const initialState : { datatimeCache: Record<string, number> } = { datatimeCache: {}}

const sowerJobDatetimeSlice = createSlice({
  name: 'sowerJobDatetime',
  initialState,
  reducers: {
    setSowerJobDatetime: (state, action: PayloadAction<string>) => {
      return { datatimeCache: {...state.datatimeCache, [action.payload]: Date.now() }};
    },
  },
});

export const { setSowerJobDatetime } = sowerJobDatetimeSlice.actions;
export const selectSowerJobDatetimeCache = (state: CoreState) =>
  state.sower.sowerJobDatetime.datatimeCache;
export const sowerJobDatetimeReducer = sowerJobDatetimeSlice.reducer;
