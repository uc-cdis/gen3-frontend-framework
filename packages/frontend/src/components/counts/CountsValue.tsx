import React from 'react';
import { LoadingOverlay, Paper } from '@mantine/core';
import { toCountsString } from '../../utils';

interface CountsValueProps {
  readonly label: string;
  readonly counts?: number;
  readonly isFetching: boolean;
  readonly isError: boolean;
}

const CountsValue = ({
  label,
  isFetching,
  isError,
  counts,
}: CountsValueProps) => {
  return (
    <div className="mr-4 relative">
      <LoadingOverlay visible={isFetching} />
      <Paper
        shadow="xs"
        p="xs"
        withBorder
        className="bg-primary text-primary-contrast font-heading text-md font-semibold"
      >
        {isError ? 'error' : toCountsString(counts, label)}
      </Paper>
    </div>
  );
};

export default CountsValue;
