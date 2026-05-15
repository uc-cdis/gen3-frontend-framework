import { Middleware, type PayloadAction } from '@reduxjs/toolkit';
import {
  addSowerJob,
  clearSowerJobsId,
  initSowerPolling,
  removeSowerJob,
  updateSowerJobStatus,
} from './jobsListSlice';
import {
  JobStage,
  type JobStatus,
  type JobWithActions,
  SowerJobStatus,
} from './types';
import { sowerJobApi } from './sowerApi';
import { showNotification } from '../notifications';
import { CoreState } from '../../reducers';

const TERMINAL_STATUSES: SowerJobStatus[] = [
  SowerJobStatus.Completed,
  SowerJobStatus.Failed,
  SowerJobStatus.Unknown,
];

const isTerminal = (status: SowerJobStatus): boolean =>
  TERMINAL_STATUSES.includes(status);

interface NotificationConfig {
  enabled: boolean;
  showJobStarted: boolean;
  showJobCompleted: boolean;
  showJobFailed: boolean;
  autoClose: number; // milliseconds
}

const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  enabled: true,
  showJobStarted: true,
  showJobCompleted: true,
  showJobFailed: true,
  autoClose: 4000,
};

const POLLING_INTERVAL = 5000; // 5 seconds

/**
 * Middleware for managing Sower job polling lifecycle
 */
const sowerJobsMiddleware: Middleware<object, CoreState, any> = (store) => {
  let pollTimeout: NodeJS.Timeout | null = null;
  let isPolling = false;
  const notificationConfig = DEFAULT_NOTIFICATION_CONFIG;

  const startPolling = () => {
    if (isPolling) return;
    isPolling = true;
    pollTimeout = setInterval(checkJobStatuses, POLLING_INTERVAL);
  };

  const stopPolling = () => {
    if (!isPolling) return;
    if (pollTimeout) {
      clearInterval(pollTimeout);
      pollTimeout = null;
    }
    isPolling = false;
  };

  const checkJobStatuses = () => {
    const state = store.getState();
    const jobIds = Object.keys(state.sowerJobsList.jobs);

    if (jobIds.length === 0) {
      stopPolling();
      return;
    }

    jobIds.forEach((jobId) => {
      const currentJob = state.sowerJobsList.jobs[jobId];
      if (isTerminal(currentJob.status)) return;

      store.dispatch(
        sowerJobApi.endpoints.getSowerJobStatus.initiate(jobId, {
          forceRefetch: true,
        }),
      );
    });
  };

  const checkForActiveJobsAndStartPolling = async () => {
    const jobsInStore = store.getState().sowerJobsList.jobs;

    try {
      const sowerJobs: Array<JobStatus> = await store
        .dispatch(
          sowerJobApi.endpoints.getSowerJobList.initiate(void 0, {
            forceRefetch: true,
          }),
        )
        .unwrap();

      const timestamp = Date.now();
      sowerJobs.forEach((job) => {
        if (!jobsInStore[job.uid]) {
          store.dispatch(
            addSowerJob({
              jobId: job.uid,
              name: job.name,
              status: job.status,
              created: timestamp,
              updated: timestamp,
              stage: isTerminal(job.status)
                ? JobStage.SendJobOutput
                : JobStage.JobDispatched,
            }),
          );
        } else {
          store.dispatch(
            updateSowerJobStatus({
              jobId: job.uid,
              status: job.status,
            }),
          );
        }
      });

      const activeJobs = sowerJobs.filter((job) => !isTerminal(job.status));
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
    } catch (error: unknown) {
      console.error(
        error instanceof Error
          ? error.message
          : 'sowerJobsMiddleware: Unknown error',
      );
    }
  };

  return (next) => (unkAction: unknown) => {
    const action = unkAction as PayloadAction<JobWithActions, string, any>;
    const prevState = store.getState();
    const result = next(action);
    const state = store.getState();

    if (initSowerPolling.match(action)) {
      checkForActiveJobsAndStartPolling();
      return result;
    }

    if (addSowerJob.match(action)) {
      startPolling();
      if (notificationConfig.enabled && notificationConfig.showJobStarted) {
        const { jobId, name } = action.payload;
        showNotification(
          `job-started-${jobId}`,
          'Job Started',
          `${name} has been submitted`,
          'info',
          { autoClose: notificationConfig.autoClose },
        );
      }
    } else if (removeSowerJob.match(action) || clearSowerJobsId.match(action)) {
      if (Object.keys(state.sower.sowerJobs.jobs).length === 0) {
        stopPolling();
      }
    } else if (updateSowerJobStatus.match(action)) {
      const { jobId, status } = action.payload;
      const prevJob = prevState.sowerJobsList.jobs[jobId];

      if (prevJob && notificationConfig.enabled && prevJob.status !== status) {
        if (
          status === SowerJobStatus.Completed &&
          notificationConfig.showJobCompleted
        ) {
          showNotification(
            `job-completed-${jobId}`,
            'Job Completed',
            `${prevJob.name} has completed successfully`,
            'success',
            { autoClose: notificationConfig.autoClose },
          );
        } else if (
          status === SowerJobStatus.Failed &&
          notificationConfig.showJobFailed
        ) {
          showNotification(
            `job-failed-${jobId}`,
            'Job Failed',
            `${prevJob.name} encountered an error`,
            'error',
            { autoClose: notificationConfig.autoClose },
          );
        }
      }

      const hasActiveJobs = Object.values(state.sower.sowerJobs.jobs).some(
        (job: JobWithActions) => !isTerminal(job.status),
      );
      if (!hasActiveJobs) {
        stopPolling();
      }
    } else if (
      action.type.endsWith('/fulfilled') &&
      action.type.includes('getSowerJobStatus')
    ) {
      const jobId = action.meta?.arg?.originalArgs;
      const jobStatus = action.payload?.status;
      const existingJob = state.sower.sowerJobs.jobs[jobId];

      if (jobId && jobStatus && existingJob) {
        if (isTerminal(jobStatus) && existingJob.status !== jobStatus) {
          store.dispatch(updateSowerJobStatus({ jobId, status: jobStatus }));
        }
      }
    }

    return result;
  };
};

export default sowerJobsMiddleware;
