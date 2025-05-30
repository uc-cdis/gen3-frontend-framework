import { isAnyOf, createListenerMiddleware } from '@reduxjs/toolkit';
import { CoreState } from '../../reducers';
import { addSowerJob, updateSowerJob, refreshSowerJobs } from './jobsListSlice';
import { selectSowerJobList } from './jobsListSelectors';
import { sowerApi } from './sowerApi';

// Create the middleware instance and methods
export const sowerListenerMiddleware = createListenerMiddleware();

sowerListenerMiddleware.startListening({
  matcher: isAnyOf(refreshSowerJobs),
  effect: async (_, listenerApi) => {
    listenerApi.cancelActiveListeners();
    const jobsState = selectSowerJobList(listenerApi.getState() as CoreState);

    try {
      const sowerJobs = await listenerApi
        .dispatch(
          sowerApi.endpoints.getSowerJobList.initiate(void 0, {
            forceRefetch: true,
          }),
        )
        .unwrap();

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
              part: job.status === 'Completed' ? 2 : 1,
            }),
          );
        } else {
          // update the status
          listenerApi.dispatch(
            updateSowerJob({
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
