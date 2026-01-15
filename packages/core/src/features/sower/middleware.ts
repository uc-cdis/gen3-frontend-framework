import { Middleware, type PayloadAction } from '@reduxjs/toolkit';
import {
  addSowerJob,
  removeSowerJob,
  clearSowerJobsId,
  updateSowerJobStatus,
  initSowerPolling,
} from './jobsListSlice';
import { type JobWithActions, type JobStatus } from './types';
import { sowerApi } from './sowerApi';
import { showNotification } from '../notifications';
import { CoreState } from '../../reducers';

interface NotificationConfig {
  enabled: boolean;
  showJobStarted: boolean;
  showJobCompleted: boolean;
  showJobFailed: boolean;
  autoClose: number; // milliseconds
}

/**
 * Middleware for managing Sower job polling lifecycle
 */
const sowerJobsMiddleware: Middleware<object, CoreState, any> = (store) => {
  let pollTimeout: NodeJS.Timeout | null = null;
  let isPolling = false;
  const POLLING_INTERVAL = 5000; // 5 seconds

  // Notification configuration - can be customized
  const notificationConfig: NotificationConfig = {
    enabled: true,
    showJobStarted: true,
    showJobCompleted: true,
    showJobFailed: true,
    autoClose: 4000,
  };

  // const fetchJobsAndUpdateStatus = () => {
  //   const state = store.getState() satisfies CoreState as CoreState;
  //   const jobsInStore = state.sowerJobsList.jobs;
  //   try {
  //     const sowerJobs: Array<JobStatus> = store
  //       .dispatch(
  //         sowerApi.endpoints.getSowerJobList.initiate(void 0, {
  //           forceRefetch: true,
  //         }),
  //       )
  //       .unwrap();
  //
  //     sowerJobs.forEach((job) => {
  //       const timestamp = Date.now();
  //       if (!jobsInStore[job.uid]) {
  //         // not in jobs list so add it, although there will be no config
  //         state.dispatch(
  //           addSowerJob({
  //             jobId: job.uid,
  //             name: job.name,
  //             status: job.status,
  //             created: timestamp,
  //             updated: timestamp,
  //             stage: job.status === 'Completed' ? 2 : 1,
  //           }),
  //         );
  //       } else {
  //         // handle changes in status
  //
  //         if (job)
  //           // update the status
  //           state.dispatch(
  //             updateSowerJobStatus({
  //               jobId: job.uid,
  //               status: job.status,
  //             }),
  //           );
  //       }
  //     });
  //
  //     // Only start polling if there are jobs
  //     if (sowerJobs.length > 0) {
  //       // Filter out jobs that are already completed/failed
  //       const activeJobs = sowerJobs.filter(
  //         (job) => !['Completed', 'Failed', 'Unknown'].includes(job.status),
  //       );
  //
  //       if (activeJobs.length > 0) {
  //         startPolling();
  //
  //         if (notificationConfig.enabled) {
  //           showNotification(
  //             'job-polling-resumed',
  //             'Monitoring Jobs',
  //             `Resuming monitoring of ${activeJobs.length} active jobs`,
  //             'info',
  //             { autoClose: 3000 },
  //           );
  //         }
  //       }
  //     }
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       console.error(error.message);
  //     } else {
  //       console.error('sowerListenerMiddleware: Unknown error');
  //     }
  //   }
  // };

  // Helper function to start polling if not already polling
  const startPolling = () => {
    if (isPolling) return;

    isPolling = true;
    console.log('Job polling started');

    // Setup interval for subsequent polls
    pollTimeout = setInterval(() => {
      checkJobStatuses();
    }, POLLING_INTERVAL);
  };

  // Helper function to stop polling
  const stopPolling = () => {
    if (!isPolling) return;

    if (pollTimeout) {
      clearInterval(pollTimeout);
      pollTimeout = null;
    }

    isPolling = false;
    console.log('Job polling stopped');
  };

  // Helper function to poll job statuses
  const checkJobStatuses = () => {
    store
      .dispatch(
        sowerApi.endpoints.getSowerJobList.initiate(void 0, {
          forceRefetch: true,
        }),
      )
      .unwrap();

    const state = store.getState();
    const jobIds = Object.keys(state.sowerJobsList.jobs);

    console.log('got job ids', jobIds);

    if (jobIds.length === 0) {
      stopPolling();
      return;
    }

    // Fetch job statuses
    jobIds.forEach((jobId) => {
      const currentJob = state.sowerJobsList.jobs[jobId];

      // Skip jobs that are already completed/failed
      if (['Completed', 'Failed', 'Unknown'].includes(currentJob.status)) {
        return;
      }

      // Initiate status check for each active job
      store.dispatch(
        sowerApi.endpoints.getSowerJobStatus.initiate(jobId, {
          forceRefetch: true,
        }),
      );
    });
  };

  const checkForActiveJobsAndStartPolling = () => {
    console.log(
      'checking for active jobs and starting polling if there are any',
    );
    const state = store.getState() satisfies CoreState as CoreState;
    const jobsInStore = state.sowerJobsList.jobs;

    try {
      const sowerJobs: Array<JobStatus> = store
        .dispatch(
          sowerApi.endpoints.getSowerJobList.initiate(void 0, {
            forceRefetch: true,
          }),
        )
        .unwrap();

      sowerJobs.forEach((job) => {
        const timestamp = Date.now();
        if (!jobsInStore[job.uid]) {
          // not in jobs list so add it, although there will be no config
          state.dispatch(
            addSowerJob({
              jobId: job.uid,
              name: job.name,
              status: job.status,
              created: timestamp,
              updated: timestamp,
              stage: job.status === 'Completed' ? 2 : 1,
            }),
          );
        } else {
          // update the status
          state.dispatch(
            updateSowerJobStatus({
              jobId: job.uid,
              status: job.status,
            }),
          );
        }
      });

      // Only start polling if there are jobs
      if (sowerJobs.length > 0) {
        // Filter out jobs that are already completed/failed
        const activeJobs = sowerJobs.filter(
          (job) => !['Completed', 'Failed', 'Unknown'].includes(job.status),
        );

        if (activeJobs.length > 0) {
          startPolling();

          if (notificationConfig.enabled) {
            showNotification(
              'job-polling-resumed',
              'Monitoring Jobs',
              `Resuming monitoring of ${activeJobs.length} active jobs`,
              'info',
              { autoClose: 3000 },
            );
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error('sowerListenerMiddleware: Unknown error');
      }
    }
  };

  // Middleware logic
  return (next) => (unkAction: unknown) => {
    const action = unkAction as PayloadAction<JobWithActions, string, any>;
    const result = next(action);
    const state = store.getState();

    // Check if this is the initialization action
    if (initSowerPolling.match(action)) {
      console.log('initSowerPolling action received, checking for active jobs');
      checkForActiveJobsAndStartPolling();
      return result;
    }

    // Check if we need to start or stop polling based on action type
    if (addSowerJob.match(action)) {
      // When a job is added, ensure polling is started
      startPolling();
      if (notificationConfig.showJobStarted && notificationConfig.enabled) {
        const job = action.payload;
        showNotification(
          `job-started-${job.jobId}`,
          'Job Started',
          `${job.name} has been submitted`,
          'info',
          { autoClose: notificationConfig.autoClose },
        );
      }
    } else if (removeSowerJob.match(action) || clearSowerJobsId.match(action)) {
      // After a job removal action, check if we should stop polling
      const jobIds = Object.keys(state.sowerJobsList.jobs);
      if (jobIds.length === 0) {
        stopPolling();
      }
    } else if (updateSowerJobStatus.match(action)) {
      // Check if this update resulted in all jobs being completed/failed
      const { jobId, status } = action.payload;
      const job = state.sowerJobsList.jobs[jobId];

      // Show notifications based on job status changes
      if (job && notificationConfig.enabled) {
        // Only notify on status transitions
        const previousStatus = job.status;
        const newStatus = status;

        if (previousStatus !== newStatus) {
          // Completed job notification
          if (
            newStatus === 'Completed' &&
            notificationConfig.showJobCompleted
          ) {
            showNotification(
              `job-completed-${jobId}`,
              'Job Completed',
              `${job.name} has completed successfully`,
              'success',
              {
                autoClose: notificationConfig.autoClose,
                onClick: job.outputGUID
                  ? () => {
                      // Optional handling of click (needs to be implemented by UI)
                    }
                  : undefined,
              },
            );
          }

          // Failed job notification
          if (newStatus === 'Failed' && notificationConfig.showJobFailed) {
            showNotification(
              `job-failed-${jobId}`,
              'Job Failed',
              `${job.name} encountered an error`,
              'error',
              { autoClose: notificationConfig.autoClose },
            );
          }
        }
      }

      const activeJobs = Object.values(state.sowerJobsList.jobs).filter(
        (job: any) => !['Completed', 'Failed', 'Unknown'].includes(job.status),
      );

      if (activeJobs.length === 0) {
        stopPolling();
      }
    } else if (
      // Handle fulfilled query responses
      action.type.endsWith('/fulfilled') &&
      action.type.includes('getSowerJobStatus')
    ) {
      // If job status changed to completed/failed, update state

      const jobId = action.meta?.arg?.originalArgs;
      const jobStatus = action.payload?.status;

      if (jobId && jobStatus && state.sowerJobsList.jobs[jobId]) {
        if (
          ['Completed', 'Failed', 'Unknown'].includes(jobStatus) &&
          state.sowerJobsList.jobs[jobId].status !== jobStatus
        ) {
          // Update job status
          store.dispatch(
            updateSowerJobStatus({
              jobId,
              status: jobStatus,
            }),
          );

          // Schedule cleanup after delay
          // setTimeout(() => {
          //   store.dispatch(removeSowerJob(jobId));
          // }, 60000); // Remove after 1 minute
        }
      }
    }

    return result;
  };
};

export default sowerJobsMiddleware;
