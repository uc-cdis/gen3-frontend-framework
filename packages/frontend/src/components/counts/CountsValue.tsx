import React from 'react';
import { Paper, LoadingOverlay } from '@mantine/core';
import { toCountsString } from '../../utils';

interface CountsValueProps {
  readonly label: string;
  readonly counts?: number;
  readonly isSuccess: boolean;
}

const CountsValue = ({ label, isSuccess, counts }: CountsValueProps) => {
  // TODO handle case of data.length == 1
  return (
    <div className="mr-4">
      <LoadingOverlay visible={!isSuccess} />
      <Paper
        shadow="xs"
        p="xs"
        withBorder
        className="bg-primary text-primary-contrast font-heading text-md font-semibold"
      >
        {toCountsString(counts, label)}
      </Paper>
    </div>
  );
};

export default CountsValue;
