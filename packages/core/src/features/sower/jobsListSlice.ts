import { createSlice, Draft, type PayloadAction } from '@reduxjs/toolkit';
import { JobWithActions } from './types';

type SowerJobUpdatePayload = Pick<JobWithActions, 'status' | 'jobId'>;
type SowerJobUpdateObjectGUID = Pick<JobWithActions, 'outputGUID' | 'jobId'>;

export interface SowerJobsListState {
  jobs: Record<string, JobWithActions>;
}

const initialState: SowerJobsListState = {
  jobs: {},
};

export const sowerJobsListSlice = createSlice({
  name: 'sowerUserJobList',
  initialState: initialState,
  reducers: {
    addSowerJob: (
      state: Draft<SowerJobsListState>,
      action: PayloadAction<JobWithActions>,
    ) => {
      if (!Object.keys(state.jobs).includes(action.payload.jobId)) {
        state.jobs[action.payload.jobId] = action.payload;
      }
    },
    updateSowerJob: (
      state: Draft<SowerJobsListState>,
      action: PayloadAction<SowerJobUpdatePayload>,
    ) => {
      if (Object.keys(state.jobs).includes(action.payload.jobId)) {
        state.jobs[action.payload.jobId] = {
          ...state.jobs[action.payload.jobId],
          ...action.payload,
          updated: Date.now(),
        };
      }
    },
    updateOutputGUID: (
      state: Draft<SowerJobsListState>,
      action: PayloadAction<SowerJobUpdateObjectGUID>,
    ) => {
      if (Object.keys(state.jobs).includes(action.payload.jobId)) {
        state.jobs[action.payload.jobId] = {
          ...state.jobs[action.payload.jobId],
          outputGUID: action.payload.outputGUID,
          updated: Date.now(),
        };
      }
    },
    removeSowerJob: (
      state: Draft<SowerJobsListState>,
      action: PayloadAction<string>,
    ) => {
      delete state.jobs[action.payload];
    },
    clearSowerJobsId: () => {
      return initialState;
    },
    refreshSowerJobs: () => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    initSowerPolling: (
      state: Draft<SowerJobsListState>,
      _action: PayloadAction<void>,
    ) => {
      return state;
    },
  },
});

export const sowerJobsListSliceReducer = sowerJobsListSlice.reducer;

export const {
  addSowerJob,
  removeSowerJob,
  clearSowerJobsId,
  updateSowerJob,
  updateOutputGUID,
  refreshSowerJobs,
  initSowerPolling,
} = sowerJobsListSlice.actions;
