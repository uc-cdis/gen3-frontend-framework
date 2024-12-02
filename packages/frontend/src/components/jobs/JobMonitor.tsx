import { useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import {
  useCoreSelector,
  selectSowerJobs,
  useGetSowerJobsStatusQuery,
} from '@gen3/core';

// Job Manager - handles polling and notifications
export const JobManager = () => {
  const jobIds = useCoreSelector(selectSowerJobs);
  const idsArray = Object.keys(jobIds);

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
      if (job.status === 'Completed') {
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
      }
    });
  }, [jobStatuses]);

  return null;
};
