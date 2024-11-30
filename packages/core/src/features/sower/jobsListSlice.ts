import { createSlice, Draft, type PayloadAction } from '@reduxjs/toolkit';

export interface SowerJobsListState {
  jobIds: string[];
}

export const sowerJobsListSlice = createSlice({
  name: 'sowerUserJobList',
  initialState: {
    jobIds: [],
  } as SowerJobsListState,
  reducers: {
    addJobId: (
      state: Draft<SowerJobsListState>,
      action: PayloadAction<string>,
    ) => {
      if (!state.jobIds.includes(action.payload)) {
        state.jobIds.push(action.payload);
      }
    },
    removeJobId: (
      state: Draft<SowerJobsListState>,
      action: PayloadAction<string>,
    ) => {
      state.jobIds = state.jobIds.filter((id) => id !== action.payload);
    },
    clearJobsId: (state: Draft<SowerJobsListState>) => {
      state.jobIds = [];
    },
  },
});

export const sowerJobsListSliceReducer = sowerJobsListSlice.reducer;

export const { addJobId, removeJobId, clearJobsId } =
  sowerJobsListSlice.actions;
