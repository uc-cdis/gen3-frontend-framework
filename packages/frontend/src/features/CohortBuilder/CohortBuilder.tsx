import React from 'react';
import { CohortPanelConfig, CohortBuilderProps } from './types';
import { Center, Loader, LoadingOverlay, Tabs } from '@mantine/core';
import { CohortPanel } from './CohortPanel';

import {
  useGetCSRFQuery,
  selectCurrentCohortId,
  addNewDefaultUnsavedCohort,
  useCoreDispatch,
  useCoreSelector,
  setSharedFilters,
} from '@gen3/core';

export const useGetCurrentCohort = () => {
  return useCoreSelector((state) => selectCurrentCohortId(state));
};

const TabsLayoutToComponentProp = (
  tabsLayout?: 'left' | 'right' | 'center',
) => {
  if (!tabsLayout) {
    return 'flex-start';
  }
  switch (tabsLayout) {
    case 'left': {
      return 'flex-start';
    }
    case 'right': {
      return 'flex-end';
    }
    case 'center': {
      return 'center';
    }
    default: {
      return 'flex-start';
    }
  }
};

export const CohortBuilder = ({
  explorerConfig,
  sharedFiltersMap = null,
  tabsLayout = 'left',
}: CohortBuilderProps) => {
  const { isFetching } = useGetCSRFQuery();

  const dispatch = useCoreDispatch();
  const currentCohort = useGetCurrentCohort();
  dispatch(setSharedFilters(sharedFiltersMap ?? {}));

  useEffect(() => {
    if (!currentCohort) dispatch(addNewDefaultUnsavedCohort());
  }, [currentCohort, dispatch]);

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
        color="primary.4"
        keepMounted={true}
        defaultValue={explorerConfig[0].tabTitle}
      >
        <Tabs.List
          className="w-full"
          justify={TabsLayoutToComponentProp(tabsLayout)}
        >
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
