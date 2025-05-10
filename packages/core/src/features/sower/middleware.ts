import { Middleware, type PayloadAction } from '@reduxjs/toolkit';
import {
  addSowerJob,
  removeSowerJob,
  clearSowerJobsId,
  updateSowerJob,
  sowerApi,
  JobWithActions,
} from './index';
import { showNotification } from '../notifications';

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
export const sowerJobsMiddleware: Middleware<object, any, any> = (store) => {
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

  // Helper function to start polling if not already polling
  const startPolling = () => {
    if (isPolling) return;

    isPolling = true;
    console.log('Job polling started');

    // Initial poll
    checkJobStatuses();

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
    const state = store.getState();
    const jobIds = Object.keys(state.sowerJobsList.jobIds);

    if (jobIds.length === 0) {
      stopPolling();
      return;
    }

    // Fetch job statuses
    jobIds.forEach((jobId) => {
      const currentJob = state.sowerJobsList.jobIds[jobId];

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

  // Middleware logic
  return (next) => (unkAction: unknown) => {
    const action = unkAction as PayloadAction<JobWithActions, string, any>;
    const result = next(action);
    const state = store.getState();

    // Check if we need to start or stop polling based on action type
    if (addSowerJob.match(action)) {
      // When a job is added, ensure polling is started
      startPolling();
    } else if (removeSowerJob.match(action) || clearSowerJobsId.match(action)) {
      // After a job removal action, check if we should stop polling
      const jobIds = Object.keys(state.sowerJobsList.jobIds);
      if (jobIds.length === 0) {
        stopPolling();
      }
    } else if (updateSowerJob.match(action)) {
      // Check if this update resulted in all jobs being completed/failed
      const { jobId, status } = action.payload;
      const job = state.sowerJobsList.jobIds[jobId];

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

      const activeJobs = Object.values(state.sowerJobsList.jobIds).filter(
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

      if (jobId && jobStatus && state.sowerJobsList.jobIds[jobId]) {
        if (
          ['Completed', 'Failed', 'Unknown'].includes(jobStatus) &&
          state.sowerJobsList.jobIds[jobId].status !== jobStatus
        ) {
          // Update job status
          store.dispatch(
            updateSowerJob({
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
