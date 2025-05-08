import { Tabs } from '@mantine/core';
import { TabsLayoutToComponentProp } from '../../utils/layout';
import React from 'react';
import { CohortDiscoveryConfig } from './types';
import IndexPanel from './IndexPanel';

interface TabbedIndexProps {
  config: CohortDiscoveryConfig;
  tabsLayout?: 'left' | 'center' | 'right';
}

const TabbedIndex = ({ config, tabsLayout = 'left' }: TabbedIndexProps) => {
  return (
    <div className="w-full">
      <Tabs
        color="primary.4"
        keepMounted={true}
        defaultValue={config.dataIndexes[0].tabTitle}
      >
        <Tabs.List
          className="w-full"
          justify={TabsLayoutToComponentProp(tabsLayout)}
        >
          {config.dataIndexes.map((panelConfig) => {
            return (
              <Tabs.Tab
                value={panelConfig.tabTitle}
                key={`${panelConfig.tabTitle}-tabList`}
              >
                {panelConfig.tabTitle}
              </Tabs.Tab>
            );
          })}
        </Tabs.List>

        {config.dataIndexes.map((panelConfig) => (
          <Tabs.Panel
            value={panelConfig.tabTitle}
            key={`${panelConfig.tabTitle}-tabPanel`}
          >
            <IndexPanel
              dataConfig={panelConfig.dataConfig}
              tabTitle={panelConfig.tabTitle}
              tabs={panelConfig.tabs}
              emptySelection={config.emptySelection}
              numColumns={panelConfig.numColumns ?? 2}
            />
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
};

export default TabbedIndex;
