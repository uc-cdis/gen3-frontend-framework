import React from 'react';
import { LoadingOverlay, Paper } from '@mantine/core';
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
      <Paper
        shadow="xs"
        p="xs"
        withBorder
        className="bg-primary text-primary-contrast font-heading text-md font-semibold"
      >
        {isError ? 'error' : toCountsString(counts, label, configuration)}
      </Paper>
    </div>
  );
};

export default CountsValue;
