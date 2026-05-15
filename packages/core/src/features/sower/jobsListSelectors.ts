import { CoreState } from '../../reducers';
import { JobWithActions } from './types';

export const selectSowerJobs = (
  state: CoreState,
): Record<string, JobWithActions> => state.sower.sowerJobs.jobs;

export const selectSowerJobList = (state: CoreState) => state.sowerJobsList;

export const selectSowerJobId = (
  state: CoreState,
  jobId: string,
): JobWithActions => state.sower.sowerJobs.jobs[jobId] ?? undefined;
