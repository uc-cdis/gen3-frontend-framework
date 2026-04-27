import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CoreState } from '../../reducers';

export interface SowerJobCacheEntry {
  id: string;
  status: string;
  action: string;
  createdAt: number;
  updatedAt: number;
}

const initialState: { datetimeCache: Record<string, SowerJobCacheEntry> } = {
  datetimeCache: {},
};

interface SowerJobActionPayload {
  id: string;
  status: string;
}

interface NewSowerJobActionPayload extends SowerJobActionPayload {
  action: string;
}

const sowerJobDatetimeSlice = createSlice({
  name: 'sowerJobDatetime',
  initialState,
  reducers: {
    setSowerJobDatetime: (
      state,
      action: PayloadAction<NewSowerJobActionPayload>,
    ) => {
      const { id, status, action: jobAction } = action.payload;
      return {
        datetimeCache: {
          ...state.datetimeCache,
          [id]: {
            id: id,
            status: status,
            action: jobAction,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        },
      };
    },
    updateSowerJobDatetime: (
      state,
      action: PayloadAction<SowerJobActionPayload>,
    ) => {
      const { id, status } = action.payload;
      const job = state.datetimeCache[id];
      return {
        datetimeCache: {
          ...state.datetimeCache,
          [id]: {
            ...job,
            status: status,
            updatedAt: Date.now(),
          },
        },
      };
    },
  },
});

export const { setSowerJobDatetime, updateSowerJobDatetime } =
  sowerJobDatetimeSlice.actions;
export const selectSowerJobDatetimeCache = (state: CoreState) =>
  state.sower.sowerJobDatetime.datetimeCache;
export const sowerJobDatetimeReducer = sowerJobDatetimeSlice.reducer;
