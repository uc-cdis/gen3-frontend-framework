import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type {
  JobId,
  JobWithActions,
  SowerJobStage,
  SowerJobStatus,
} from './types';
import type { CoreState } from '../../reducers';

interface UpdateSowerJobStatus {
  jobId: JobId;
  status: SowerJobStatus;
}

interface UpdateSowerJobStage {
  jobId: JobId;
  stage: SowerJobStage;
}

interface UpdateSowerJobCompleted {
  jobId: JobId;
  stage: SowerJobStage;
  status: SowerJobStatus;
  outputGUID?: string;
}

export const sowerJobListAdapter = createEntityAdapter<JobWithActions, JobId>({
  sortComparer: (a, b) => {
    if (a.updated <= b.updated) return 1;
    else return -1;
  },
  selectId: (job: JobWithActions) => job.uid,
});

const initialState = sowerJobListAdapter.getInitialState();

const sowerJobsListSlice = createSlice({
  name: 'sowerJobsList',
  initialState,
  reducers: {
    addSowerJob: (state, action: PayloadAction<JobWithActions>) => {
      const date = Date.now();
      sowerJobListAdapter.addOne(state, {
        ...action.payload,
        created: date,
        updated: date,
      });
    },
    removeSowerJob: (state, action: PayloadAction<JobId>) => {
      sowerJobListAdapter.removeOne(state, action.payload);
    },
    updateSowerJobStatus: (
      state,
      action: PayloadAction<UpdateSowerJobStatus>,
    ) => {
      const { jobId, status } = action.payload;

      sowerJobListAdapter.updateOne(state, {
        id: jobId,
        changes: {
          status: status,
          updated: Date.now(),
        },
      });
    },
    updateSowerJobStage: (
      state,
      action: PayloadAction<UpdateSowerJobStage>,
    ) => {
      const { jobId, stage } = action.payload;

      sowerJobListAdapter.updateOne(state, {
        id: jobId,
        changes: {
          stage: stage,
          updated: Date.now(),
        },
      });
    },
    updateSowerJob: (state, action: PayloadAction<UpdateSowerJobCompleted>) => {
      const { jobId, stage, status, outputGUID } = action.payload;
      sowerJobListAdapter.updateOne(state, {
        id: jobId,
        changes: {
          stage: stage,
          updated: Date.now(),
          status: status,
          outputGUID: outputGUID,
        },
      });
    },
  },
});

export const {
  addSowerJob,
  removeSowerJob,
  updateSowerJobStatus,
  updateSowerJobStage,
  updateSowerJob,
} = sowerJobsListSlice.actions;

export const sowerJobsListReducer = sowerJobsListSlice.reducer;

/**
 * Returns the selectors for the cohorts EntityAdapter
 * @param state - the CoreState
 *
 * @hidden
 */
export const sowerJobListSelectors = sowerJobListAdapter.getSelectors(
  (state: CoreState) => state.sower.sowerJobsList,
);
