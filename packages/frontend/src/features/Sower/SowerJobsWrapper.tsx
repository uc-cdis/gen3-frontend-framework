import React from 'react';
import {
  useGetSowerJobListQuery,
  useCoreSelector,
  selectSowerJobDatetimeCache,
} from '@gen3/core';
import JobPanel from './JobPanel';

const SowerJobListWrapper = () => {
  const { data, isLoading, refetch } = useGetSowerJobListQuery();
  const sowerJobDatetimeCache = useCoreSelector(selectSowerJobDatetimeCache);

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
