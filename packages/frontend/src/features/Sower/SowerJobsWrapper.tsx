import React, { useEffect, useMemo } from 'react';
import {
  useGetSowerJobListQuery,
  useCoreSelector,
  selectSowerJobDatetimeCache,
} from '@gen3/core';
import JobPanel from './JobPanel';
import useSowerJobEventBus from './useSowerJobEventBus';
import { showNotification } from '@mantine/notifications';

const SowerJobListWrapper = () => {
  const { data, isLoading, refetch } = useGetSowerJobListQuery();
  const sowerJobDatetimeCache = useCoreSelector(selectSowerJobDatetimeCache);
  const { on, off } = useSowerJobEventBus();
  const activeJobs = useMemo(
    () =>
      (data || [])
        .filter((job) => job.status === 'Running')
        .map((job) => job.uid),
    [data],
  );

  useEffect(() => {
    on('jobWrapper', activeJobs, (uid) =>
      showNotification({ message: `Job ${uid} completed` }),
    );

    return () => off('jobWrapper');
  }, [activeJobs]);

  return (
    <JobPanel
      data={data}
      isLoading={isLoading}
      refetch={refetch}
      sowerJobDatetimeCache={sowerJobDatetimeCache}
    />
  );
};

export default SowerJobListWrapper;
