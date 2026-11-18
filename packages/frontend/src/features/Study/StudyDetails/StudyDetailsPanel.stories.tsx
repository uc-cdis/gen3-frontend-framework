import React, { useState } from 'react';
import type { Meta } from '@storybook/nextjs-vite';
import StudyDetailsPanel from './StudyDetailsPanel';
import { JSONObject } from '@gen3/core';
import { StudyDetailView } from '../types';
import {
  discoveryConfigTestTags,
  testData,
  testStudyConfig,
} from './StudyDetailsPanelTestData';
import { DiscoveryIndexConfig } from '../../Discovery/types';
import DiscoveryProvider from '../../Discovery/DiscoveryProvider';
import { AccessLevel } from '../../../utils';

const meta = {
  component: StudyDetailsPanel as any,
  decorators: [
    (Story) => {
      const [selectedAccessLevels, setSelectedAccessLevels] = useState<
        number[]
      >([]);

      return (
        <DiscoveryProvider
          discoveryConfig={
            discoveryConfigTestTags as unknown as DiscoveryIndexConfig
          }
          selectedTags={{}}
          setSelectedTags={() => {}}
          selectedAccessLevels={selectedAccessLevels}
          setSelectedAccessLevels={setSelectedAccessLevels}
          enabledAccessLevels={
            new Set([
              AccessLevel.ACCESSIBLE,
              AccessLevel.UNACCESSIBLE,
              AccessLevel.WAITING,
            ])
          }
        >
          <div>
            <Story />
          </div>
        </DiscoveryProvider>
      );
    },
  ],
  parameters: { deepControls: { enabled: true } },
} satisfies Meta<typeof StudyDetailsPanel>;

export default meta;

type StoryArgs = { data: JSONObject; studyConfig: StudyDetailView };

const render = (args: StoryArgs) => (
  <StudyDetailsPanel data={args.data} studyConfig={args.studyConfig} />
);

export const Default: any = {
  render,
  args: {
    data: testData,
    studyConfig: testStudyConfig,
  },
};
