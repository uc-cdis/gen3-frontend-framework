import React from 'react';
import { Loader, Paper } from '@mantine/core';
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
      radius="lg"
      p="md"
      className="w-full flex justify-center items-center gap-4"
    >
      <Icon size={24} className={`text-${color}`} />

      <div className="flex gap-2 items-center ">
        {isLoading ? (
          <Loader type="dots" />
        ) : (
          <p className="text-md font-bold">{count}</p>
        )}
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
