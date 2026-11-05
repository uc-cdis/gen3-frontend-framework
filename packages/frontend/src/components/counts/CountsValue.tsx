import React from 'react';
import { Badge, LoadingOverlay } from '@mantine/core';
import { labelToPlural } from '../../utils/labels';

interface CountsValueProps {
  label: string;
  counts?: number;
  isFetching: boolean;
  isError: boolean;
}

const CountsValue = ({
  label,
  isFetching,
  isError,
  counts,
}: Readonly<CountsValueProps>) => {
  return (
    <div className="relative mr-4">
      <LoadingOverlay visible={isFetching} />
      <Badge
        autoContrast
        size="xl"
        radius="xs"
        color="secondary.4"
        classNames={{
          root: 'h-full',
          label: 'font-bold text-contrast-secondary',
        }}
      >
        {isError
          ? 'error'
          : `${counts ? counts.toLocaleString() : '--'} ${counts != 1 ? labelToPlural(label) : label}`}
      </Badge>
    </div>
  );
};

export default CountsValue;
