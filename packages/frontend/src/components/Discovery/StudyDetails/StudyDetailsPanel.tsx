import React, { ReactElement } from 'react';
import { Tabs } from '@mantine/core';
import { JSONObject } from '@gen3/core';
import { StudyDetailView } from '../types';
import StudyGroupPanel from './StudyGroupPanel';

interface StudyDetailsPanelProps {
  readonly data: JSONObject;
  readonly studyConfig: StudyDetailView;
}

const StudyDetailsPanel = ( {
  data,
  studyConfig}: StudyDetailsPanelProps
): ReactElement => {
  console.log('StudyDetailsPanel', data);
  return (
    <React.Fragment>
      <Tabs>
        <Tabs.List>
          {studyConfig.tabs.map((tab) => {
            return (
              <Tabs.Tab value={tab.tabName} key={`${tab.tabName}-tab-tab`}>
                {tab.tabName}
              </Tabs.Tab>
            );
          })}
          {studyConfig.tabs.map((tab) => {
            return (
              <Tabs.Panel value={tab.tabName} key={`${tab.tabName}-tab-panel`}>
                <StudyGroupPanel data={data} groups={tab.groups} />
              </Tabs.Panel>
            );
          })}
        </Tabs.List>
      </Tabs>
    </React.Fragment>
  );
};

export default StudyDetailsPanel;
