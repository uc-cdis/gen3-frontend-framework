import React from 'react';
import { Paper, Loader } from '@mantine/core';
import { FaExclamationTriangle as FailedIcon } from 'react-icons/fa';
import { LuClock as CompletedIcon } from 'react-icons/lu';
import { FiActivity as ActiveIcon } from 'react-icons/fi';
import { IconBaseProps } from 'react-icons';
import { JobListResponse } from '@gen3/core';

interface JobOverviewCardProps {
  readonly Icon: React.FC<IconBaseProps>;
  readonly color: string;
  readonly count: number;
  readonly text: string;
  readonly isLoading: boolean;
}

const JobOverviewCard = ({
  Icon,
  color,
  count,
  text,
  isLoading,
}: JobOverviewCardProps) => {
  return (
    <Paper
      shadow="md"
      radius="lg"
      p="md"
      className="w-full flex flex-row gap-4"
    >
      <div
        className={`w-16 h-16 flex justify-center items-center rounded-md bg-${color} bg-opacity-25`}
      >
        <Icon size={32} className={`text-${color}`} />
      </div>
      <div className="flex flex-col">
        {isLoading ? <Loader type="dots" /> : <p className="text-2xl font-bold">{count}</p>}
        {text}
      </div>
    </Paper>
  );
};

interface JobOverviewProps {
  readonly data: JobListResponse | undefined;
  readonly isLoading: boolean;
}

const JobOverview = ({ data, isLoading }: JobOverviewProps) => {
  const groupedData = data ? Object.groupBy(data, (row) => row.status) : {};

  return (
    <div className="flex gap-4 py-8">
      <JobOverviewCard
        Icon={ActiveIcon}
        count={groupedData?.Running?.length || 0}
        text="Active Jobs"
        color="utility-success"
        isLoading={isLoading}
      />
      <JobOverviewCard
        Icon={CompletedIcon}
        count={groupedData?.Completed?.length || 0}
        text="Completed"
        color="utility-success"
        isLoading={isLoading}
      />
      <JobOverviewCard
        Icon={FailedIcon}
        count={groupedData?.Failed?.length || 0}
        text="Failed"
        color="utility-error"
        isLoading={isLoading}
      />
    </div>
  );
};

export default JobOverview;
