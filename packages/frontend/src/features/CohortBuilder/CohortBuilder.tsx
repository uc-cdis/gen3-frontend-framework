import React from 'react';
import { CohortPanelConfig, CohortBuilderConfiguration } from './types';
import { Center, Loader, Tabs } from '@mantine/core';
import { CohortPanel } from './CohortPanel';
import { useGetCSRFQuery } from '@gen3/core';

export const CohortBuilder = ({
  explorerConfig,
}: CohortBuilderConfiguration) => {
  const { isLoading } = useGetCSRFQuery();

  if (isLoading) {
    return (
      <Center maw={400} h={100} mx="auto">
        <Loader variant="dots" />
      </Center>
    );
  }

  return (
    <div className="w-full">
      <Tabs
        color="primary-lighter"
        classNames={{
          tab: 'data-active:bg-primary-lighter data-active:text-primary-lighter-contrast hover:bg-primary hover:text-primary-lightest-contrast',
        }}
        keepMounted={false}
        defaultValue={explorerConfig[0].tabTitle}
      >
        <Tabs.List>
          {explorerConfig.map((panelConfig: CohortPanelConfig) => (
            <Tabs.Tab
              value={panelConfig.tabTitle}
              key={`${panelConfig.tabTitle}-tabList`}
            >
              {panelConfig.tabTitle}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {explorerConfig.map((panelConfig: CohortPanelConfig) => (
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
