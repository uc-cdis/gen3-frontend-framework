import { useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import {
  CoreDispatch,
  useCoreSelector,
  selectSowerJobs,
  useGetSowerJobsStatusQuery,
  removeSowerJob,
  useCoreDispatch,
  type CreateAndExportActionConfig,
  coreStore,
  addSowerJob,
  updateSowerJob,
  type JobWithActions,
} from '@gen3/core';
import { bindSendResultsAction } from '../../features/CohortBuilder/downloads/actions/TwoStepActionButton';

const handleError = (
  dispatch: CoreDispatch,
  jobId: string,
  message: string,
) => {
  notifications.show({
    title: 'Error',
    message,
    color: 'red',
  });
  coreStore.dispatch(removeSowerJob(jobId));
};

export const registerJob = (
  dispatch: CoreDispatch,
  jobId: string,
  config: CreateAndExportActionConfig,
) => {
  dispatch(
    addSowerJob({
      jobId,
      config,
      part: 1,
      created: Date.now(),
      updated: Date.now(),
      name: '',
      status: 'Unknown',
    }),
  );
};

const runSendActionb = async (
  dispatch: CoreDispatch,
  pendingAction: JobWithActions,
) => {
  try {
    // get the objectId of the job
    const action = bindSendResultsAction(
      pendingAction.config.sendJobAction.actionName,
    );
    await action({
      parameters: pendingAction.config.sendJobAction.parameters,
    });

    notifications.show({
      title: 'Success',
      message: 'Action completed successfully',
      color: 'green',
    });

    dispatch(removeSowerJob(pendingAction.jobId));
  } catch (error: unknown) {
    handleError(
      dispatch,
      pendingAction.jobId,
      'Failed to complete second step',
    );
  }
};

// Job Manager - handles polling and notifications
export const JobManager = () => {
  const jobIds = useCoreSelector(selectSowerJobs);
  const dispatch = useCoreDispatch();
  const runningJobs = Object.values(jobIds).reduce(
    (acc, job) => {
      if (
        job.part === 1 &&
        job.status !== 'Completed' &&
        job.status !== 'Failed'
      ) {
        acc[job.jobId] = job;
      }
      return acc;
    },
    {} as Record<string, JobWithActions>,
  );
  const idsArray = Object.keys(runningJobs);

  // get updates for the status of all running jobs

  const { data: jobStatuses, refetch } = useGetSowerJobsStatusQuery(idsArray, {
    skip: idsArray.length === 0,
    pollingInterval: 5000,
  });

  useEffect(() => {
    if (idsArray.length > 0) {
      refetch();
    }
  }, [idsArray.length, jobIds, refetch]);

  useEffect(() => {
    if (!jobStatuses) return;

    Object.entries(jobStatuses).forEach(([id, job]) => {
      const sowerJob = jobIds[id];
      if (job.status === 'Completed' || sowerJob.part === 1) {
        // need to execute send action
        notifications.show({
          title: 'Job Completed',
          message: `${job.name} (${id}) has finished successfully`,
          color: 'green',
        });
      } else if (job.status === 'Failed') {
        notifications.show({
          title: 'Job Failed',
          message: `${job.name} (${id}) has failed`,
          color: 'red',
        });
        dispatch(removeSowerJob(id));
      } else {
        dispatch(
          updateSowerJob({
            jobId: id,
            status: job?.status || 'Unknown',
          }),
        );
      }
    });
  }, [dispatch, jobIds, jobStatuses]);

  return null;
};
