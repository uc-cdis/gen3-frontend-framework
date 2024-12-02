import { CoreState } from '../../reducers';
import { JobWithActions } from './types';

export const selectSowerJobs = (
  state: CoreState,
): Record<string, JobWithActions> => state.sowerJobsList.jobIds;

export const selectSowerJobId = (
  state: CoreState,
  jobId: string,
): JobWithActions => state.sowerJobsList.jobIds[jobId] ?? undefined;
