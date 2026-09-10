import React, { useEffect, useMemo } from 'react';
import {
  selectSowerJobDatetimeCache,
  useCoreSelector,
  useGetSowerJobListQuery,
} from '@gen3/core';
import JobPanel from './JobPanel';
import { SowerProvider, useSowerContext } from './SowerContext';
import { showNotification } from '@mantine/notifications';

const SowerJobListInner = () => {
  const { data, isLoading, refetch } = useGetSowerJobListQuery();
  const sowerJobDatetimeCache = useCoreSelector(selectSowerJobDatetimeCache);
  const { on, off } = useSowerContext();
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

const SowerJobListWrapper = () => (
  <SowerProvider>
    <SowerJobListInner />
  </SowerProvider>
);

export default SowerJobListWrapper;
