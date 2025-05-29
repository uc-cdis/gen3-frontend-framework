import { createSelector } from '@reduxjs/toolkit';
import { CoreState } from '../../reducers';
import { JobWithActions } from './types';

export const selectSowerJobs = (
  state: CoreState,
): Record<string, JobWithActions> => state.sowerJobsList.jobs;

export const selectSowerJobList = (state: CoreState) => state.sowerJobsList;

export const selectSowerJobListWithStatus = createSelector(
  (state: CoreState) => state.sowerJobsList,
  (sowerJobsState) => ({
    jobs: sowerJobsState.jobs,
    error: sowerJobsState.error,
    isUninitialized: sowerJobsState.status === 'uninitialized',
    isFetching: sowerJobsState.status === 'pending',
    isSuccess: sowerJobsState.status === 'fulfilled',
    isError: sowerJobsState.status === 'rejected',
  }),
);

export const selectSowerJobId = (
  state: CoreState,
  jobId: string,
): JobWithActions => state.sowerJobsList.jobs[jobId] ?? undefined;
