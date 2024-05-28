import React from 'react';
import { SegmentedControl } from '@mantine/core';
import { ViewType } from './types';

interface ViewSelectorProps {
  view: ViewType;
  setView: (_: ViewType) => void;
}
const ViewSelector = ({ view, setView }: ViewSelectorProps) => {
  return (
    <div className="flex justify-center border-t-0 border-1 border-gray-400 py-10">
      <SegmentedControl
        classNames={{
          root: 'p-0 bg-base-max border-primary border-2 rounded-l',
          controlActive: `bg-primary text-primary-contrast ${
            view === 'table' ? 'rounded-l-lg' : 'rounded-r-lg'
          }`,
        }}
        value={view}
        onChange={setView}
        data={[
          { label: 'Table View', value: 'table' },
          { label: 'Graph View', value: 'graph' },
        ]}
      />
    </div>
  );
};

export default ViewSelector;
