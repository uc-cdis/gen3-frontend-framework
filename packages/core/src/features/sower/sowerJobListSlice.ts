import {
  createEntityAdapter,
  createSlice,
  type EntityState,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { JobId, JobWithActions, SowerJobStage } from './types';
import { isTerminalStatus, SowerJobStatus } from './types';
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
}

interface UpdateSowerJobOutputError {
  jobId: JobId;
  outputError: boolean;
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
    /** Replaces the job list, used when loading a user's persisted jobs. */
    hydrateSowerJobs: (
      _,
      action: PayloadAction<EntityState<JobWithActions, JobId>>,
    ) => action.payload,
    /** Empties the job list, used when the logged-in user changes. */
    clearSowerJobs: () => initialState,
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
      const job = state.entities[jobId];
      if (!job || job.status === status) return;
      // a late Unknown must not regress a finished job
      if (isTerminalStatus(job.status) && status === SowerJobStatus.Unknown)
        return;

      sowerJobListAdapter.updateOne(state, {
        id: jobId,
        changes: {
          status: status,
          updated: Date.now(),
          statusStale: false,
        },
      });
    },
    /** Pauses polling for jobs that have been Unknown past the timeout. */
    markSowerJobsStatusStale: (state, action: PayloadAction<JobId[]>) => {
      for (const id of action.payload) {
        const job = state.entities[id];
        if (job?.status === SowerJobStatus.Unknown) job.statusStale = true;
      }
    },
    /** Resumes polling for a stale Unknown job and restarts its timeout. */
    retrySowerJobStatus: (state, action: PayloadAction<JobId>) => {
      const job = state.entities[action.payload];
      if (job?.status !== SowerJobStatus.Unknown) return;
      job.statusStale = false;
      job.updated = Date.now();
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
    /**
     * Removes jobs last updated before the given timestamp (ms since epoch).
     * Running jobs are kept regardless of age: they are still being polled and
     * may yet produce output.
     */
    removeSowerJobsUpdatedBefore: (state, action: PayloadAction<number>) => {
      const cutoff = action.payload;
      const expiredIds = Object.values(state.entities)
        .filter(
          (job) =>
            job.status !== SowerJobStatus.Running && job.updated < cutoff,
        )
        .map((job) => job.uid);
      if (expiredIds.length > 0) {
        sowerJobListAdapter.removeMany(state, expiredIds);
      }
    },
    updateSowerJob: (state, action: PayloadAction<UpdateSowerJobCompleted>) => {
      const { jobId, stage, status } = action.payload;
      sowerJobListAdapter.updateOne(state, {
        id: jobId,
        changes: {
          stage: stage,
          updated: Date.now(),
          status: status,
        },
      });
    },
    updateSowerJobOutputError: (
      state,
      action: PayloadAction<UpdateSowerJobOutputError>,
    ) => {
      const { jobId, outputGUID, outputError } = action.payload;
      sowerJobListAdapter.updateOne(state, {
        id: jobId,
        changes: {
          outputError: outputError,
          outputGUID: outputGUID,
        },
      });
    },
  },
});

export const {
  hydrateSowerJobs,
  clearSowerJobs,
  addSowerJob,
  removeSowerJob,
  removeSowerJobsUpdatedBefore,
  updateSowerJobStatus,
  markSowerJobsStatusStale,
  retrySowerJobStatus,
  updateSowerJobStage,
  updateSowerJob,
  updateSowerJobOutputError,
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
