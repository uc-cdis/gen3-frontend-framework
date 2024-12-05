import { createSlice, Draft, type PayloadAction } from '@reduxjs/toolkit';
import { JobWithActions } from './types';

type SowerJobUpdatePayload = Pick<JobWithActions, 'status' | 'jobId'>;

export interface SowerJobsListState {
  jobIds: Record<string, JobWithActions>;
}

const initialState: SowerJobsListState = {
  jobIds: {},
};

export const sowerJobsListSlice = createSlice({
  name: 'sowerUserJobList',
  initialState: initialState,
  reducers: {
    addSowerJob: (
      state: Draft<SowerJobsListState>,
      action: PayloadAction<JobWithActions>,
    ) => {
      if (!Object.keys(state.jobIds).includes(action.payload.jobId)) {
        state.jobIds[action.payload.jobId] = action.payload;
      }
    },
    updateSowerJob: (
      state: Draft<SowerJobsListState>,
      action: PayloadAction<SowerJobUpdatePayload>,
    ) => {
      if (Object.keys(state.jobIds).includes(action.payload.jobId)) {
        state.jobIds[action.payload.jobId] = {
          ...state.jobIds[action.payload.jobId],
          ...action.payload,
          updated: Date.now(),
        };
      }
    },
    removeSowerJob: (
      state: Draft<SowerJobsListState>,
      action: PayloadAction<string>,
    ) => {
      delete state.jobIds[action.payload];
    },
    clearSowerJobsId: () => {
      return initialState;
    },
  },
});

export const sowerJobsListSliceReducer = sowerJobsListSlice.reducer;

export const { addSowerJob, removeSowerJob, clearSowerJobsId, updateSowerJob } =
  sowerJobsListSlice.actions;
