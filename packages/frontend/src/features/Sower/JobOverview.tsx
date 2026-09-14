import React from 'react';
import { Paper } from '@mantine/core';
import { FaExclamationTriangle as FailedIcon } from 'react-icons/fa';
import { LuClock as CompletedIcon } from 'react-icons/lu';
import { FiActivity as ActiveIcon } from 'react-icons/fi';
import type { IconBaseProps } from 'react-icons';
import type { JobWithActions } from '@gen3/core';
import { backgroundStyles, colorClasses } from './colors';

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
  const { bg, text: textColor } = colorClasses[color] ?? { bg: '', text: '' };
  return (
    <Paper
      shadow="md"
      radius="lg"
      p="md"
      className="w-full flex flex-row gap-4"
    >
      <div
        className="w-16 h-16 flex justify-center items-center rounded-md"
        style={backgroundStyles[color]}
      >
        <Icon size={32} className={`${textColor}`} />
      </div>
      <div className="flex flex-col">
        <p className="text-2xl font-bold">{count}</p>
        {text}
      </div>
    </Paper>
  );
};

interface JobOverviewProps {
  readonly data?: Array<JobWithActions>;
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
