import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CoreState } from '../../reducers';

export type DRSHostnameMap = Record<string, string>;

const initialState : Record<string, string> = {};

// TODO: document what this does
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

export const drsHostnamesSelector = (id:string, state: CoreState) =>
  state.drsHostnames?.[id];
