import React, { ReactElement } from 'react';
import { Text, Tabs } from '@mantine/core';
import { JSONObject } from '@gen3/core';
import { StudyDetailView } from '../types';
import StudyGroupPanel from './StudyGroupPanel';
import { JSONPath } from 'jsonpath-plus';

interface StudyDetailsPanelProps {
  readonly data: JSONObject;
  readonly studyConfig: StudyDetailView;
}

const StudyDetailsPanel = ({
  data,
  studyConfig,
}: StudyDetailsPanelProps): ReactElement => {
  const headerText = JSONPath({
    json: data,
    path: studyConfig.headerField,
  });
  return (
    <div>
      <Text size="lg" weight={700} className="mb-4">
        {headerText}
      </Text>
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
    </div>
  );
};

export default StudyDetailsPanel;
