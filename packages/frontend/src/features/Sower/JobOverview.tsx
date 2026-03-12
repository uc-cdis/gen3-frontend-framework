import React from 'react';
import { Paper } from '@mantine/core';
import { JobListResponse } from '@gen3/core';
import { FaExclamationTriangle as FailedIcon } from 'react-icons/fa';
import { LuClock as CompletedIcon } from 'react-icons/lu';
import { FiActivity as ActiveIcon } from 'react-icons/fi';
import { IconBaseProps } from 'react-icons';

interface JobOverviewCardProps {
  readonly Icon: React.FC<IconBaseProps>;
  readonly color: string;
  readonly count: number;
  readonly text: string;
}

const JobOverviewCard = ({
  Icon,
  color,
  count,
  text,
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
        <p className="text-2xl font-bold">{count}</p>
        {text}
      </div>
    </Paper>
  );
};

interface JobOverviewProps {
  readonly data: JobListResponse | undefined;
  readonly isLoading: boolean;
}

const JobOverview = ({ data }: JobOverviewProps) => {
  const groupedData = data ? Object.groupBy(data, (row) => row.status) : {};

  return (
    <div className="flex gap-4 py-8">
      <JobOverviewCard
        Icon={ActiveIcon}
        count={groupedData?.Running?.length || 0}
        text="Active Jobs"
        color="utility-success"
      />
      <JobOverviewCard
        Icon={CompletedIcon}
        count={groupedData?.Completed?.length || 0}
        text="Completed"
        color="utility-success"
      />
      <JobOverviewCard
        Icon={FailedIcon}
        count={groupedData?.Failed?.length || 0}
        text="Failed"
        color="utility-error"
      />
    </div>
  );
};

export default JobOverview;
