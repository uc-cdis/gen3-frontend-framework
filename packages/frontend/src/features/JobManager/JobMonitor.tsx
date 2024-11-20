import { useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useGetSowerJobListQuery } from '@gen3/core';

const GlobalJobMonitor = () => {
  const {
    data: jobs,
    isError,
    isSuccess,
  } = useGetSowerJobListQuery(undefined, {
    pollingInterval: 500,
    refetchOnMountOrArgChange: 1800,
    refetchOnFocus: true,
  });

  useEffect(() => {
    if (jobs && jobs.length > 0) {
      jobs.forEach((job) => {
        if (!['Running'].includes(job.status)) {
          notifications.show({
            id: job.uid,
            title: `Job ${job.uid}`,
            message: `Status: ${job.status}`,
            color: job.status === 'Completed' ? 'green' : 'red',
            icon:
              job.status === 'Completed' ? (
                <IconCheck size="1.1rem" />
              ) : (
                <IconX size="1.1rem" />
              ),
            autoClose: 5000,
          });
        }
      });
    }
  }, [jobs]);

  return null;
};

export default GlobalJobMonitor;
