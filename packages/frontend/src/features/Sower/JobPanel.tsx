import React from 'react';
import { QueryActionCreatorResult } from '@reduxjs/toolkit/query';
import { Button } from '@mantine/core';
import { JobListResponse, GetSowerJobListQueryType } from '@gen3/core';
import { LuRefreshCw as RefreshIcon } from 'react-icons/lu';
import JobTable from './JobTable';
import JobOverview from './JobOverview';

export interface JobPanelProps {
  readonly data: JobListResponse | undefined;
  readonly isLoading: boolean;
  readonly refetch: () => QueryActionCreatorResult<GetSowerJobListQueryType>;
  readonly sowerJobDatetimeCache: Record<string, number>;
}

const JobPanel = ({
  data,
  isLoading,
  refetch,
  sowerJobDatetimeCache,
}: JobPanelProps) => {
  return (
    <div className="p-4">
      <div className="flex justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p>Monitor and manage all running and completed jobs.</p>
        </div>
        <Button leftSection={<RefreshIcon />} variant="white" onClick={refetch}>
          Refresh
        </Button>
      </div>
      <JobOverview data={data} isLoading={isLoading} />
      <JobTable
        data={data}
        isLoading={isLoading}
        sowerJobDatetimeCache={sowerJobDatetimeCache}
      />
    </div>
  );
};

export default JobPanel;
