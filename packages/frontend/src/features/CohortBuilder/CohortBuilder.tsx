import React from 'react';
import { useDeepCompareMemo } from 'use-deep-compare';
import { CohortBuilderProps, CohortPanelConfiguration } from './types';
import { Tabs } from '@mantine/core';
import { CohortPanel } from './CohortPanel';
import {
  selectCurrentCohortId,
  setSharedFilters,
  useCoreDispatch,
  useCoreSelector,
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
  const dispatch = useCoreDispatch();
  dispatch(setSharedFilters(sharedFiltersMap ?? {}));

  const configuration = useDeepCompareMemo(
    () => explorerConfig,
    [explorerConfig],
  );

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
          {configuration.map((panelConfig: CohortPanelConfiguration) => (
            <Tabs.Tab
              value={panelConfig.tabTitle}
              key={`${panelConfig.tabTitle}-tabList`}
            >
              {panelConfig.tabTitle}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {configuration.map((panelConfig: CohortPanelConfiguration) => (
          <Tabs.Panel
            value={panelConfig.tabTitle}
            key={`${panelConfig.tabTitle}-tabPanel`}
          >
            <CohortPanel
              guppyConfig={panelConfig.guppyConfig}
              key={`${panelConfig.tabTitle}-CohortPanel`}
              chartsSection={panelConfig?.chartsSection}
              filters={panelConfig.filters}
              tabTitle={panelConfig.tabTitle}
              table={panelConfig.table}
              dropdowns={panelConfig.dropdowns}
              buttons={panelConfig.buttons}
              loginForDownload={panelConfig.loginForDownload}
              sharedFiltersMap={panelConfig.sharedFiltersMap}
            />
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
};

CohortBuilder.whyDidYouRender = true;
