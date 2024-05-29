import React from 'react';
import { SegmentedControl } from '@mantine/core';
import { ViewType } from './types';

interface ViewSelectorProps {
  view: ViewType;
  setView: (_: ViewType) => void;
}
const ViewSelector = ({ view, setView }: ViewSelectorProps) => {
  return (
    <SegmentedControl
      fullWidth
      size="lg"
      styles={(theme) => {
        console.log('theme', theme.colors.primary);
        return {
          root: {
            padding: '0px',
            backgroundColor: theme.colors.base[9],
            borderColor: theme.colors.primary[5],
            borderWidth: 2,
          },
          controlActive: {
            backgroundColor: theme.colors.primary[7],
            color: theme.colors['primary-contrast'][7],
          },
          label: {
            color: theme.colors['primary-contrast'][7],
          },
        };
      }}
      value={view}
      onChange={setView}
      data={[
        { label: 'Table View', value: 'table' },
        { label: 'Graph View', value: 'graph' },
      ]}
    />
  );
};

export default ViewSelector;
