import React from 'react';
import type { ChartProps } from './types';
import { RollingNumber, Text } from '@mantine/core';

const Count = ({ xLabel, total }: ChartProps) => {
  return (
    <div className="flex flex-col justify-center items-center">
      <Text fw={500}>{xLabel}</Text>
      <RollingNumber value={total} fz="2rem" thousandSeparator />
    </div>
  );
};

export default Count;
