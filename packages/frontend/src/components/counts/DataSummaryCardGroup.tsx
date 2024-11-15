import React from 'react';
import { Group } from '@mantine/core';

interface CountsForField {
  field: string;
  index: string;
}

interface CountsBarProps extends CountsForField {
  label: string;
}

interface Props {
  countsHook: (param: Array<CountsForField>) => Record<string, number>;
  counts: Array<CountsBarProps>;
}

const DataSummaryCardGroup: React.FC<Props> = (
  { counts, countsHook },
  deprecatedLegacyContext,
) => {
  return <Group></Group>;
};

export default DataSummaryCardGroup;
