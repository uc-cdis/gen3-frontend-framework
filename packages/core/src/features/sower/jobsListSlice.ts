import { createSlice, Draft, type PayloadAction } from '@reduxjs/toolkit';
import { JobWithActions } from './types';

type SowerJobUpdateStage = Pick<JobWithActions, 'stage' | 'jobId'>;
type SowerJobUpdateStatus = Pick<JobWithActions, 'status' | 'jobId'>;
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
    updateSowerJobStatus: (
      state: Draft<SowerJobsListState>,
      action: PayloadAction<SowerJobUpdateStatus>,
    ) => {
      const { jobId, status } = action.payload;
      if (Object.keys(state.jobs).includes(jobId)) {
        state.jobs[jobId] = {
          ...state.jobs[jobId],
          status: status,
          updated: Date.now(),
        };
      }
    },
    updateSowerJobStage: (
      state: Draft<SowerJobsListState>,
      action: PayloadAction<SowerJobUpdateStage>,
    ) => {
      const { jobId, stage } = action.payload;
      if (Object.keys(state.jobs).includes(jobId)) {
        state.jobs[jobId] = {
          ...state.jobs[jobId],
          stage: stage,
          updated: Date.now(),
        };
      }
    },

    updateOutputGUID: (
      state: Draft<SowerJobsListState>,
      action: PayloadAction<SowerJobUpdateObjectGUID>,
    ) => {
      const { jobId, outputGUID } = action.payload;
      if (Object.keys(state.jobs).includes(jobId)) {
        state.jobs[jobId] = {
          ...state.jobs[jobId],
          outputGUID: outputGUID,
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
  updateSowerJobStatus,
  updateSowerJobStage,
  updateOutputGUID,
  refreshSowerJobs,
  initSowerPolling,
} = sowerJobsListSlice.actions;
