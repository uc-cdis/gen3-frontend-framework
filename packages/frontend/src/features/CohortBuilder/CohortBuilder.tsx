import React, { useEffect } from 'react';
import { CohortPanelConfig, CohortBuilderConfiguration } from './types';
import { Center, Loader, Tabs } from '@mantine/core';
import { CohortPanel } from './CohortPanel';
import {
  useGetCSRFQuery,
  selectCurrentCohortId,
  useCoreDispatch,
  useCoreSelector,
} from '@gen3/core';
import { useSetupInitialCohorts } from './hooks';

export const useGetCurrentCohort = () => {
  return useCoreSelector((state) => selectCurrentCohortId(state));
};

export const CohortBuilder = ({
  explorerConfig,
}: CohortBuilderConfiguration) => {
  const { isLoading } = useGetCSRFQuery();
  const dispatch = useCoreDispatch();
  const currentCohort = useGetCurrentCohort();

  // console.log('before useSetupInitialCohorts');
  //const initialCohortsFetched = useSetupInitialCohorts();

  // useEffect(() => {
  //   // if (!currentCohort) dispatch(addNewDefaultUnsavedCohort());
  // }, [currentCohort, dispatch]);

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
