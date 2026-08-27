import React from 'react';
import type { Meta } from '@storybook/nextjs';
import AccessDescriptor from './AccessDescriptor';

const meta = {
  component: AccessDescriptor,
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
} satisfies Meta<typeof AccessDescriptor>;

export default meta;

export const Default: any = {
  args: {
    __accessible: 1,
  },
};
export const UNACCESSIBLE: any = {
  args: {
    __accessible: 2,
  },
};
export const MIXED: any = {
  args: {
    __accessible: 6,
  },
};
export const UNKNOWN: any = {
  args: {
    __accessible: 5,
  },
};
