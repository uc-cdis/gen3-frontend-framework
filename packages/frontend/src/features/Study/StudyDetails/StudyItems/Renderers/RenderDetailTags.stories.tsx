import React from 'react';
import type { Meta } from '@storybook/nextjs';
import RenderDetailTags from './RenderDetailTags';
import { JSONValue } from '@gen3/core';
import DiscoveryProvider from '../../../../Discovery/DiscoveryProvider';
import { DiscoveryIndexConfig } from '../../../../Discovery/types';

const discoveryConfigTags = {
  tags: {
    tagCategories: [
      {
        name: 'Study Type',
        color: '#532565',
        display: true,
      },
      {
        name: 'Data Type',
        color: '#982568',
        display: true,
      },
      {
        name: 'Data Repository',
        color: '#bf362e',
        display: true,
      },
    ],
  },
};

const meta = {
  component: RenderDetailTags as any,
  decorators: [
    (Story) => (
      <DiscoveryProvider
        discoveryIndexConfig={
          discoveryConfigTags as unknown as DiscoveryIndexConfig
        }
      >
        <div className="bg-base-lighter p-4" style={{ minHeight: 120 }}>
          <Story />
        </div>
      </DiscoveryProvider>
    ),
  ],
  parameters: { deepControls: { enabled: true } },
  argTypes: {
    fieldValue: { control: 'object' },
    _label: { control: 'text' },
    fieldConfig: { control: 'object' },
  },
} satisfies Meta<typeof RenderDetailTags>;

export default meta;

type StoryArgs = {
  fieldValue: JSONValue;
  _label?: string;
  fieldConfig?: Record<string, any>;
};

const render = (args: StoryArgs) =>
  RenderDetailTags(args.fieldValue, args._label, args.fieldConfig);

const sampleResource = {
  tags: [
    {
      name: 'Open Science Framework',
      category: 'Data Repository',
    },
    {
      name: 'Basic Research',
      category: 'Study Type',
    },
    {
      name: 'Pre-Clinical Research',
      category: 'Study Type',
    },
    {
      name: 'Data Type Name',
      category: 'Data Type',
    },
  ],
};

export const Default: any = {
  render,
  args: {
    fieldValue: sampleResource,
    _label: 'Tags',
    fieldConfig: {
      contentType: 'tags',
      field: 'tags',
      categories: ['Study Type', 'Data Repository', 'Data Type'],
    },
  },
};
