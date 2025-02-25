import React, { useState } from 'react';
import {
  Group,
  Select,
  Stack,
  Switch,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { Icon } from '@iconify/react';
import type { TabConfig } from '../types';
import { FiltersPanel } from '../FiltersPanel';
import {
  useCoreSelector,
  selectAllCohortFiltersCollapsed,
  toggleCohortBuilderAllFilters,
  useCoreDispatch,
  selectShouldShareFilters,
  setShouldShareFilters,
  type FacetDefinition,
  selectSharedFilters,
} from '@gen3/core';
import { TabbablePanelProps } from './types';
import { useDeepCompareMemo } from 'use-deep-compare';

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

  const sharedFilters = useCoreSelector((state) => selectSharedFilters(state));

  const shareFilters = useCoreSelector((state) =>
    selectShouldShareFilters(state),
  );

  const theme = useMantineTheme();
  const coreDispatch = useCoreDispatch();

  const toggleAllFiltersExpanded = (expand: boolean) => {
    coreDispatch(toggleCohortBuilderAllFilters({ expand, index }));
  };

  const items = useDeepCompareMemo(
    () =>
      filters.tabs.map((tab: TabConfig, idx) => {
        return { label: tab.title, value: idx.toString() };
      }),
    [filters.tabs],
  );

  const fields = useDeepCompareMemo(
    () =>
      filters.tabs[Number(value)].fields.reduce((acc, field) => {
        return [...acc, facetDefinitions[field]];
      }, [] as FacetDefinition[]),
    [filters.tabs, value],
  );

  const handleSharedFiltersChange = (value: boolean) => {
    modals.openConfirmModal({
      title: 'Confirm change of shared filters mode',
      children: (
        <Text size="sm">
          {value
            ? 'Switching to Shared Filters mode will apply all selected filters across all indices.'
            : 'Switching to Unshared Filters mode will stop syncing filters but will not remove them.'}
        </Text>
      ),
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onConfirm: () => coreDispatch(setShouldShareFilters(value)),
    });
  };

  return (
    <Stack align="flex-start">
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
      <Stack className="bg-base-max py-4 px-2 h-full w-full">
        {Object.keys(sharedFilters).length > 0 && (
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
            <Switch
              checked={shareFilters}
              onChange={(event) =>
                handleSharedFiltersChange(event.currentTarget.checked)
              }
            />
          </Group>
        )}
        <Select
          classNames={{
            options: 'border-1 border-base-dark',
            option: 'hover:bg-primary-lightest',
          }}
          withCheckIcon={false}
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
