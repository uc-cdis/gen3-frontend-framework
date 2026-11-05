import React from 'react';
import type { JobWithActions } from '@gen3/core';
import JobTable from './JobTable';
import JobOverview from './JobOverview';

export interface JobPanelProps {
  readonly data: JobWithActions[];
}

const JobPanel = ({ data }: JobPanelProps) => {
  return (
    <div className="p-4">
      <div className="flex justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p>Monitor and manage all running and completed jobs.</p>
        </div>
      </div>
      <JobOverview data={data} />
      <JobTable data={data} />
    </div>
  );
};

export default JobPanel;
