import { createSlice, Draft, type PayloadAction } from '@reduxjs/toolkit';

export interface SowerJobsListState {
  jobIds: Set<string>;
}

export const sowerJobsListSlice = createSlice({
  name: 'sowerUserJobList',
  initialState: {
    jobIds: new Set(),
  } as SowerJobsListState,
  reducers: {
    addJobId: (
      state: Draft<SowerJobsListState>,
      action: PayloadAction<string>,
    ) => {
      state.jobIds.add(action.payload);
    },
    removeJobId: (
      state: Draft<SowerJobsListState>,
      action: PayloadAction<string>,
    ) => {
      state.jobIds.delete(action.payload);
    },
    clearJobsId: (state: Draft<SowerJobsListState>) => {
      state.jobIds.clear();
    },
  },
});

export const sowerJobsListSliceReducer = sowerJobsListSlice.reducer;

export const { addJobId, removeJobId, clearJobsId } =
  sowerJobsListSlice.actions;
