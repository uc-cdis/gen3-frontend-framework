import React from 'react';
import { selectSowerJobsList, useCoreSelector } from '@gen3/core';
import JobPanel from './JobPanel';

const SowerJobListWrapper = () => {
  const sowerJobs = useCoreSelector(selectSowerJobsList);

  return <JobPanel data={sowerJobs} />;
};

export default SowerJobListWrapper;
