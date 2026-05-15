import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { CoreState } from '../../reducers';
import {
  addSowerJob,
  refreshSowerJobs,
  updateSowerJobStatus,
} from './jobsListSlice';
import { selectSowerJobList } from './jobsListSelectors';
import { sowerJobApi } from './sowerApi';
import { type JobStatus } from './types';

// Create the middleware instance and methods
export const sowerListenerMiddleware = createListenerMiddleware();

const GetObjectIdsForCompletedJobs = async (
  jobs: Array<JobStatus>,
  dispatch: CoreState['dispatch'],
) => {
  const objectIds: Record<string, string> = {};
  for (const job of jobs) {
    if (job.status === 'Completed') {
      const objectId = await dispatch.sowerApi.endpoints.getSowerOutput
        .initiate(job.uid, {
          forceRefetch: true,
        })
        .unwrap();
      objectIds[job.uid] = objectId;
    }
  }
  return objectIds;
};

sowerListenerMiddleware.startListening({
  matcher: isAnyOf(refreshSowerJobs),
  effect: async (_, listenerApi) => {
    listenerApi.cancelActiveListeners();
    const jobsState = selectSowerJobList(listenerApi.getState() as CoreState);

    try {
      const sowerJobs = await listenerApi
        .dispatch(
          sowerJobApi.endpoints.getSowerJobList.initiate(void 0, {
            forceRefetch: true,
          }),
        )
        .unwrap();

      const missingJobs = sowerJobs.filter((job) => !jobsState.jobs[job.uid]);

      const outputGuids = await GetObjectIdsForCompletedJobs(
        missingJobs,
        listenerApi.dispatch,
      );

      sowerJobs.forEach((job) => {
        const timestamp = Date.now();
        if (!jobsState.jobs[job.uid]) {
          // not in jobs list so add it, although there will be no config
          listenerApi.dispatch(
            addSowerJob({
              jobId: job.uid,
              name: job.name,
              status: job.status,
              created: timestamp,
              updated: timestamp,
              outputGUID:
                job.uid in outputGuids ? outputGuids[job.uid] : undefined,
              stage: job.status === 'Completed' ? 2 : 1,
            }),
          );
        } else {
          // update the status
          listenerApi.dispatch(
            updateSowerJobStatus({
              jobId: job.uid,
              status: job.status,
            }),
          );
        }
      });

      // merge status of jobs
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error('sowerListenerMiddleware: Unknown error');
      }
    }
  },
});
