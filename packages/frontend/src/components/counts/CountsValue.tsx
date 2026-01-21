import React from 'react';
import { Badge, LoadingOverlay } from '@mantine/core';
import { toCountsString } from '../../utils';
import { NodeCountConfiguration } from '../../features/CohortBuilder/types';

interface CountsValueProps {
  label: string;
  counts?: number;
  isFetching: boolean;
  isError: boolean;
  configuration?: NodeCountConfiguration;
}

const CountsValue = ({
  label,
  isFetching,
  isError,
  counts,
  configuration,
}: Readonly<CountsValueProps>) => {
  return (
    <div className="relative mr-4">
      <LoadingOverlay visible={isFetching} />
      <Badge
        autoContrast
        size="xl"
        radius="xs"
        color="secondary.4"
        classNames={{ root: 'h-full' }}
      >
        {isError ? 'error' : toCountsString(counts, label, configuration)}
      </Badge>
    </div>
  );
};

export default CountsValue;
