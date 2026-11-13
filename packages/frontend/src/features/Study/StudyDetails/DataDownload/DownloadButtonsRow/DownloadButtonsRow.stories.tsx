import React from 'react';
import { http, HttpResponse } from 'msw';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { GEN3_FENCE_API } from '@gen3/core';
import DownloadButtonsRow from './DownloadButtonsRow';
import DiscoveryProvider from '../../../../Discovery/DiscoveryProvider';
import type { DiscoveryIndexConfig } from '../../../../Discovery/types';

const discoveryIndexConfig = {
  minimalFieldMapping: { uid: '_hdp_uid' },
  features: { authorization: { enabled: false } },
  variableMetadataFieldName: 'variable_level_metadata',
  exportToWorkspace: {
    enableDownloadManifest: true,
    manifestFieldName: '__manifest',
    enableDownloadStudyMetadata: true,
    studyMetadataFieldName: 'study_metadata',
    enableDownloadVariableMetadata: true,
  },
} as unknown as DiscoveryIndexConfig;

const study = {
  _hdp_uid: 'HDP00619',
  study_metadata: {
    minimal_info: { study_name: 'Example study' },
  },
  __manifest: [
    {
      file_name: 'example_protocol.pdf',
      object_id: 'dg.HEAL/00000000-0000-0000-0000-000000000000',
    },
  ],
  variable_level_metadata: {
    data_dictionaries: { example_dictionary: 'HDPDD00001' },
    common_data_elements: {
      '5086 Brief Pain Inventory (BPI)': 'HDPCDE5086',
    },
  },
};

const meta = {
  component: DownloadButtonsRow,
  title: 'Features/Study/StudyDetails/DataDownload/DownloadButtonsRow',
  decorators: [
    (Story) => (
      <DiscoveryProvider discoveryIndexConfig={discoveryIndexConfig}>
        <div className="bg-base-lighter p-4 h-96">
          <Story />
        </div>
      </DiscoveryProvider>
    ),
  ],
  parameters: {
    deepControls: { enabled: true },
  },
} satisfies Meta<typeof DownloadButtonsRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { data: study },
};

export const LoggedIn: Story = {
  args: { data: study },
  parameters: {
    msw: {
      handlers: [
        http.get(`${GEN3_FENCE_API}/user`, () =>
          HttpResponse.json({
            username: 'test.user@example.org',
            active: true,
          }),
        ),
      ],
    },
  },
};
