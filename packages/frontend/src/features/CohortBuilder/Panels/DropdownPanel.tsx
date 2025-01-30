import React, { useState } from 'react';
import { Select, Stack } from '@mantine/core';
import type { TabConfig } from '../types';
import { FiltersPanel } from '../FiltersPanel';
import type { FacetDefinition } from '@gen3/core';
import { TabbablePanelProps } from './types';

export const DropdownPanel = ({
  filters,
  tabTitle,
  facetDefinitions,
  facetDataHooks,
}: TabbablePanelProps) => {
  const [value, setValue] = useState<string | null>('0');

  const items = filters.tabs.map((tab: TabConfig, idx) => {
    return { label: tab.title, value: idx.toString() };
  });

  console.log('items', items);
  console.log(
    'filters.tabs',
    filters,
    Number(value),
    filters.tabs[Number(value)].fields,
    facetDefinitions,
  );

  const fields = filters.tabs[Number(value)].fields.reduce((acc, field) => {
    return [...acc, facetDefinitions[field]];
  }, [] as FacetDefinition[]);

  console.log('fields', fields);
  return (
    <Stack>
      <Select
        label="Filters"
        data={items}
        value={value === null ? '0' : value}
        onChange={setValue}
      />
      {Object.keys(facetDefinitions).length > 0 ? (
        <FiltersPanel
          fields={fields}
          dataFunctions={facetDataHooks}
          valueLabel={tabTitle}
        />
      ) : null}
    </Stack>
  );
};

export default DropdownPanel;
