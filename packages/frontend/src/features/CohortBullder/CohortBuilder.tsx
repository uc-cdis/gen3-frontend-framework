'use client';
import React from 'react';
import { CohortPanelConfig, CohortBuilderConfiguration } from '@gen3/core';
import midrcConfig from '../../components/data/midrc.json';
import { Tabs } from '@mantine/core';
import { CohortPanel } from './CohortPanel';

interface CohortBuilderProps {
  config?: CohortBuilderConfiguration;
}

export const CohortBuilder = ({ config = midrcConfig as unknown as CohortBuilderConfiguration  }: CohortBuilderProps) => {
  return (
    <div>
      <Tabs
            color="primary-lighter"
            classNames={{
                tab: 'data-active:bg-primary-lighter data-active:text-primary-lighter-contrast hover:bg-primary hover:text-primary-lightest-contrast',
            }}
            keepMounted={false}
            defaultValue={config.explorerConfig[0].tabTitle}>
        <Tabs.List>
          {config.explorerConfig.map((panelConfig: CohortPanelConfig) => (
            <Tabs.Tab
              value={panelConfig.tabTitle}
              key={`${panelConfig.tabTitle}-tabList`}
            >
              {panelConfig.tabTitle}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {config.explorerConfig.map((panelConfig: CohortPanelConfig) => (
          <Tabs.Panel
            value={panelConfig.tabTitle}
            key={`${panelConfig.tabTitle}-tabPanel`}
          >
            <CohortPanel
              {...panelConfig}
              key={`${panelConfig.tabTitle}-CohortPanel`}
            />
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
};
