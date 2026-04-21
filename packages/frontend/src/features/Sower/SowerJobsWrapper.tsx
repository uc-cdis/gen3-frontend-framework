import React, { useEffect, useState } from 'react';
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
  const [pollingInterval, setPollingInterval] = useState<number>(0);
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

  useEffect(() => {
    if (activeJobs.length > 0) {
      setPollingInterval(3000);
    } else {
      setPollingInterval(0);
    }
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

SowerJobListWrapper.displayName = 'SowerJobListWrapper';

export default SowerJobListWrapper;
