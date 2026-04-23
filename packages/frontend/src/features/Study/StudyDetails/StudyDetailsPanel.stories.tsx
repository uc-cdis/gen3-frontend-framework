import React from 'react';
import type { Meta } from '@storybook/nextjs';
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

const meta = {
  component: StudyDetailsPanel as any,
  decorators: [
    (Story) => (
      <DiscoveryProvider
        discoveryIndexConfig={
          discoveryConfigTestTags as unknown as DiscoveryIndexConfig
        }
      >
        <div>
          <Story />
        </div>
      </DiscoveryProvider>
    ),
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
