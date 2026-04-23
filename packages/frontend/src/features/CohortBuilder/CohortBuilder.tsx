import React from 'react';
import { useDeepCompareMemo } from 'use-deep-compare';
import { CohortBuilderProps, CohortPanelConfiguration } from './types';
import { Tabs } from '@mantine/core';
import { CohortPanelNew as CohortPanel } from './CohortPanelNew';
import {
  selectCurrentCohortId,
  setSharedFilters,
  useCoreDispatch,
  useCoreSelector,
} from '@gen3/core';
import { TabsLayoutToComponentProp } from '../../utils/layout';
import CohortManager from './CohortManager/CohortManager';

export const useGetCurrentCohort = () => {
  return useCoreSelector((state) => selectCurrentCohortId(state));
};

const CohortBuilder = ({
  explorerConfig,
  sharedFiltersMap = null,
  tabsLayout = 'left',
  enableCohortManager = true,
  activeTab,
}: CohortBuilderProps) => {
  const dispatch = useCoreDispatch();
  dispatch(setSharedFilters(sharedFiltersMap ?? {}));

  console.log('CohortBuilder component rendered', explorerConfig);

  const configuration = useDeepCompareMemo(
    () => explorerConfig,
    [explorerConfig],
  );

  return (
    <div className="flex flex-col w-full mt-2">
      {enableCohortManager ? <CohortManager /> : null}
      <Tabs
        color="primary.5"
        variant={explorerConfig[0]?.tabType}
        keepMounted={true}
        defaultValue={activeTab ?? explorerConfig[0].tabTitle}
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
              dataConfig={panelConfig.dataConfig}
              key={`${panelConfig.tabTitle}-CohortPanel`}
              chartsSection={panelConfig?.chartsSection}
              charts={panelConfig?.charts}
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

export default CohortBuilder;
