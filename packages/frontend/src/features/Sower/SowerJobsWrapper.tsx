import React, { useEffect, useRef } from 'react';
import {
  selectSowerJobDatetimeCache,
  useCoreSelector,
  useGetSowerJobListQuery,
} from '@gen3/core';
import JobPanel from './JobPanel';
import { showNotification } from '@mantine/notifications';

const SowerJobListWrapper = () => {
  const { data, isLoading, refetch } = useGetSowerJobListQuery();
  const sowerJobDatetimeCache = useCoreSelector(selectSowerJobDatetimeCache);
  const prevRunningRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!data) return;
    const currentRunning = new Set(
      data.filter((j) => j.status === 'Running').map((j) => j.uid),
    );
    for (const uid of prevRunningRef.current) {
      if (!currentRunning.has(uid)) {
        const job = data.find((j) => j.uid === uid);
        if (job?.status === 'Completed') {
          showNotification({ message: `Job ${uid} completed` });
        }
      }
    }
    prevRunningRef.current = currentRunning;
  }, [data]);

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
