import {
  Accordion,
  Group,
  Stack,
  Switch,
  Text,
  useMantineTheme,
} from '@mantine/core';
import type { TabConfig } from '../types';
import { FiltersPanel } from '../FiltersPanel';
import {
  FacetDefinition,
  selectAllCohortFiltersCollapsed,
  selectSharedFilters,
  selectShouldShareFilters,
  setShouldShareFilters,
  toggleCohortBuilderAllFilters,
  useCoreDispatch,
  useCoreSelector,
} from '@gen3/core';
import React from 'react';
import { TabbablePanelProps } from './types';
import { Icon } from '@iconify/react';
import { modals } from '@mantine/modals';

export const AccordionPanel = ({
  index,
  filters,
  tabTitle,
  facetDefinitions,
  facetDataHooks,
}: TabbablePanelProps) => {
  const coreDispatch = useCoreDispatch();
  const sharedFilters = useCoreSelector((state) => selectSharedFilters(state));
  const theme = useMantineTheme();
  const shareFilters = useCoreSelector((state) =>
    selectShouldShareFilters(state),
  );
  const allFiltersCollapsed = useCoreSelector((state) =>
    selectAllCohortFiltersCollapsed(state, index),
  );
  const toggleAllFiltersExpanded = (expand: boolean) => {
    coreDispatch(toggleCohortBuilderAllFilters({ expand, index }));
  };
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
        <Accordion
          chevronPosition="left"
          multiple={true}
          defaultValue={[filters?.tabs[0].title ?? 'Filters']}
        >
          {filters.tabs.map((tab: TabConfig) => {
            return (
              <Accordion.Item value={tab.title} key={`${tab.title}`}>
                <Accordion.Control>{tab.title}</Accordion.Control>
                <Accordion.Panel classNames={{ panel: 'p-0 m-0' }}>
                  {Object.keys(facetDefinitions).length > 0 ? (
                    <FiltersPanel
                      fields={tab.fields.reduce((acc, field) => {
                        return [...acc, facetDefinitions[field]];
                      }, [] as FacetDefinition[])}
                      dataFunctions={facetDataHooks}
                      valueLabel={tabTitle}
                    />
                  ) : null}
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </Stack>
    </Stack>
  );
};

export default AccordionPanel;
