import { Accordion } from '@mantine/core';
import type { TabConfig } from '../types';
import { FiltersPanel } from '../FiltersPanel';
import type { FacetDefinition } from '@gen3/core';
import React from 'react';
import { TabbablePanelProps } from './types';

export const AccordionPanel = ({
  filters,
  tabTitle,
  facetDefinitions,
  facetDataHooks,
}: TabbablePanelProps) => {
  return (
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
  );
};

export default AccordionPanel;
