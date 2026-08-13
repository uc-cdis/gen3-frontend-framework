import React from 'react';
import type { Meta } from '@storybook/nextjs';
import DownloadButtonsRow from './DownloadButtonsRow';

const meta: any = {
  component: DownloadButtonsRow,
  decorators: [
    (Story) => (
      <div className="bg-base-lighter p-4 h-96">
        <Story />
      </div>
    ),
  ],
  parameters: {
    deepControls: { enabled: true },
  },
} satisfies Meta<typeof DownloadButtonsRow>;

export default meta;

export const Default: any = {
  args: {
    data: { example: 'data' },
  },
};
