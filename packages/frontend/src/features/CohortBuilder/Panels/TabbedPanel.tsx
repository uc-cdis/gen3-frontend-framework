import { Tabs } from '@mantine/core';
import { TabConfig } from '../types';
import { FiltersPanel } from '../FiltersPanel';
import { FacetDefinition } from '@gen3/core';
import React from 'react';
import { TabbablePanelProps } from './types';

const VerticalTabbedPanel = ({
  filters,
  tabTitle,
  facetDefinitions,
  facetDataHooks,
}: TabbablePanelProps) => {
  return (
    <div>
      <Tabs
        variant="pills"
        orientation="vertical"
        keepMounted={false}
        defaultValue={filters?.tabs[0].title ?? 'Filters'}
      >
        <Tabs.List>
          {filters.tabs.map((tab: TabConfig) => {
            return (
              <Tabs.Tab value={tab.title} key={`${tab.title}-tab`}>
                {tab.title}
              </Tabs.Tab>
            );
          })}
        </Tabs.List>

        {filters.tabs.map((tab: TabConfig) => {
          return (
            <Tabs.Panel
              value={tab.title}
              key={`filter-${tab.title}-tabPanel`}
              className="w-1/4"
            >
              {Object.keys(facetDefinitions).length > 0 ? (
                <FiltersPanel
                  fields={tab.fields.reduce((acc, field) => {
                    return [...acc, facetDefinitions[field]];
                  }, [] as FacetDefinition[])}
                  dataFunctions={facetDataHooks}
                  valueLabel={tabTitle}
                />
              ) : null}
            </Tabs.Panel>
          );
        })}
      </Tabs>
    </div>
  );
};

const SinglePanel = ({
  filters,
  tabTitle,
  facetDefinitions,
  facetDataHooks,
}: TabbablePanelProps) => {
  return (
    <div>
      {Object.keys(facetDefinitions).length > 0 ? (
        <FiltersPanel
          fields={filters.tabs[0].fields.reduce((acc, field) => {
            return [...acc, facetDefinitions[field]];
          }, [] as FacetDefinition[])}
          dataFunctions={facetDataHooks}
          valueLabel={tabTitle}
        />
      ) : null}
    </div>
  );
};

export const TabbedPanel = ({
  filters,
  tabTitle,
  facetDefinitions,
  facetDataHooks,
}: TabbablePanelProps) => {
  return filters.tabs.length > 1 ? (
    <VerticalTabbedPanel
      filters={filters}
      tabTitle={tabTitle}
      facetDefinitions={facetDefinitions}
      facetDataHooks={facetDataHooks}
    />
  ) : (
    <SinglePanel
      filters={filters}
      tabTitle={tabTitle}
      facetDefinitions={facetDefinitions}
      facetDataHooks={facetDataHooks}
    />
  );
};
