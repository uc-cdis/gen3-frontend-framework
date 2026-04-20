import React, { useEffect } from 'react';
import {
  selectSowerJobDatetimeCache,
  useCoreSelector,
  useGetSowerJobListQuery,
} from '@gen3/core';
import JobPanel from './JobPanel';
import useSowerJobEventBus from './useSowerJobEventBus';
import { showNotification } from '@mantine/notifications';
import { useDeepCompareMemo } from 'use-deep-compare';

const SowerJobListWrapper = () => {
  const { data, isLoading, refetch } = useGetSowerJobListQuery();
  const sowerJobDatetimeCache = useCoreSelector(selectSowerJobDatetimeCache);
  const { on, off } = useSowerJobEventBus();
  const activeJobs = useDeepCompareMemo(
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
  }, [activeJobs, off, on]);

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
