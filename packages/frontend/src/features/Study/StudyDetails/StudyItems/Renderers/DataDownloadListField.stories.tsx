import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import DataDownloadListField from './DataDownloadListField';

const meta = {
  component: DataDownloadListField,
  decorators: [
    (Story) => (
      <div className="bg-base-lighter p-4 h-120">
        <Story />
      </div>
    ),
  ],
  parameters: {
    deepControls: { enabled: true },
  },
} satisfies Meta<typeof DataDownloadListField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    __manifest: [
      {
        md5sum: 'a',
        file_size: 535337,
        file_name: 'File Name 1.pdf',
        commons_url: 'externaldata.healdata.org',
        object_id: '1',
      },
      {
        md5sum: 'b',
        file_size: 419168,
        file_name: 'File Name 2.pdf',
        commons_url: 'externaldata.healdata.org',
        object_id: '2',
      },
      {
        md5sum: 'c',
        file_size: 36862,
        file_name: 'File Name 3.pdf',
        commons_url: 'externaldata.healdata.org',
        object_id: '3',
      },
      {
        md5sum: 'd',
        file_size: 632795,
        file_name: 'File Name 4.pdf',
        commons_url: 'externaldata.healdata.org',
        object_id: '4',
      },
    ],
  } as unknown as never,
};
export const NoDataProvided: Story = {
  args: {
    __manifest: '',
  } as unknown as never,
};
