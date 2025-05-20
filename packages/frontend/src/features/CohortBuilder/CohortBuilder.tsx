import React from 'react';
import { CohortBuilderProps, CohortPanelConfiguration } from './types';
import { Tabs } from '@mantine/core';
import { CohortPanel } from './CohortPanel';
import {
  selectCurrentCohortId,
  setSharedFilters,
  useCoreDispatch,
  useCoreSelector,
  useGetCSRFQuery,
} from '@gen3/core';
import { TabsLayoutToComponentProp } from '../../utils/layout';

export const useGetCurrentCohort = () => {
  return useCoreSelector((state) => selectCurrentCohortId(state));
};

export const CohortBuilder = ({
  explorerConfig,
  sharedFiltersMap = null,
  tabsLayout = 'left',
}: CohortBuilderProps) => {
  useGetCSRFQuery();

  const dispatch = useCoreDispatch();
  dispatch(setSharedFilters(sharedFiltersMap ?? {}));

  console.log('Cohort Builder');

  return (
    <div className="w-full">
      <Tabs
        color="primary.4"
        keepMounted={true}
        defaultValue={explorerConfig[0].tabTitle}
      >
        <Tabs.List
          className="w-full"
          justify={TabsLayoutToComponentProp(tabsLayout)}
        >
          {explorerConfig.map((panelConfig: CohortPanelConfiguration) => (
            <Tabs.Tab
              value={panelConfig.tabTitle}
              key={`${panelConfig.tabTitle}-tabList`}
            >
              {panelConfig.tabTitle}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {explorerConfig.map((panelConfig: CohortPanelConfiguration) => (
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
