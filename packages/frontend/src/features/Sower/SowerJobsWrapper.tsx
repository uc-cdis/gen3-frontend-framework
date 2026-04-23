import React from 'react';
import {
  selectSowerJobDatetimeCache,
  useCoreSelector,
  useGetSowerJobListQuery,
} from '@gen3/core';
import JobPanel from './JobPanel';
import useSowerJobEventBus from './useSowerJobEventBus';
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
