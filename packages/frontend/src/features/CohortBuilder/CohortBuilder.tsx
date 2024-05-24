import React from 'react';
import { CohortPanelConfig, CohortBuilderConfiguration } from './types';
import { Center, Loader, Tabs } from '@mantine/core';
import { CohortPanel } from './CohortPanel';
import { useGetCSRFQuery } from '@gen3/core';

export const CohortBuilder = ({ explorerConfig }: CohortBuilderConfiguration) => {
  const { isFetching, isError } =  useGetCSRFQuery(); // need to have a CSRF token to add to the guppy calls

  if (isFetching) {
    return (<div className="flex w-full py-24 relative justify-center"><Loader  variant="dots"  /> </div>);
  }

  if (isError) {
    return (
    <Center maw={400} h={100} mx="auto">
      <div>Explorer config is not defined. Page disabled</div>
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
            defaultValue={explorerConfig[0].tabTitle}>
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
