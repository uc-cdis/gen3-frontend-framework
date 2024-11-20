import { createSelector } from '@reduxjs/toolkit';
import { CoreState } from '../../reducers';
import { JobStatus } from './types';
import { loadingStatusApi } from './sowerApi';

const selectSowerJobsResult =
  loadingStatusApi.endpoints.getSowerJobList.select();

export const selectAllJobs = createSelector(
  selectSowerJobsResult,
  (result) => result.data ?? [],
);

export const selectJobById = createSelector(
  [selectAllJobs, (_state: CoreState, uid: string) => uid],
  (jobs, uid) => jobs.find((job) => job.uid === uid),
);

export const selectJobsByStatus = createSelector(
  [selectAllJobs, (_state: CoreState, status: JobStatus['status']) => status],
  (jobs, status) => jobs.filter((job) => job.status === status),
);

export const selectRunningJobs = createSelector(selectAllJobs, (jobs) =>
  jobs.filter((job) => job.status === 'Running'),
);

export const selectCompletedJobs = createSelector(selectAllJobs, (jobs) =>
  jobs.filter((job) => job.status === 'Completed'),
);

export const selectFailedJobs = createSelector(selectAllJobs, (jobs) =>
  jobs.filter((job) => job.status === 'Failed'),
);
