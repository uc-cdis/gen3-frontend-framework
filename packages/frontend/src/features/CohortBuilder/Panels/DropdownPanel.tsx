import React, { useState } from 'react';
import {
  Group,
  Select,
  Stack,
  Switch,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { Icon } from '@iconify/react';
import type { TabConfig } from '../types';
import { FiltersPanel } from '../FiltersPanel';
import {
  useCoreSelector,
  selectAllCohortFiltersCollapsed,
  toggleCohortBuilderAllFilters,
  useCoreDispatch,
  type FacetDefinition,
} from '@gen3/core';
import { TabbablePanelProps } from './types';

export const DropdownPanel = ({
  index,
  filters,
  tabTitle,
  facetDefinitions,
  facetDataHooks,
}: TabbablePanelProps) => {
  const [value, setValue] = useState<string | null>('0');
  const allFiltersCollapsed = useCoreSelector((state) =>
    selectAllCohortFiltersCollapsed(state, index),
  );
  const theme = useMantineTheme();
  const coreDispatch = useCoreDispatch();

  const toggleAllFiltersExpanded = (expand: boolean) => {
    coreDispatch(toggleCohortBuilderAllFilters({ expand, index }));
  };

  const items = filters.tabs.map((tab: TabConfig, idx) => {
    return { label: tab.title, value: idx.toString() };
  });

  const fields = filters.tabs[Number(value)].fields.reduce((acc, field) => {
    return [...acc, facetDefinitions[field]];
  }, [] as FacetDefinition[]);

  return (
    <Stack align="flex-start" className="mx-3 w-full">
      <Group justify="space-between" className="w-full">
        <Text size="xl" fw={800}>
          Filters
        </Text>
        <button
          className="text-primary text-sm font-normal"
          onClick={() => toggleAllFiltersExpanded(allFiltersCollapsed)}
        >
          {allFiltersCollapsed ? 'Expand All' : 'Collapse All'}
        </button>
      </Group>
      <Stack className="w-full bg-base-max py-4 px-2 h-full">
        <Group gap="xs" justify="space-between">
          <div className="flex items-center space-x-1">
            <Icon
              icon="gen3:share"
              height={16}
              width={16}
              color={theme.colors.accent[4]}
            />
            <Text size="sm">Set the shared filters for all</Text>
            <Icon
              icon="gen3:info"
              height={12}
              width={12}
              color={theme.colors.accent[4]}
            />
          </div>
          <Switch />
        </Group>
        <Select
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
    </Stack>
  );
};

export default DropdownPanel;
