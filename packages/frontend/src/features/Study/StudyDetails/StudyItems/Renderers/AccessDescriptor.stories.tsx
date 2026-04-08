import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import AccessDescriptor from './AccessDescriptor';
import { accessibleFieldName, AccessLevel } from '../../../../../utils';

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

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    __accessible: 1,
  },
};
export const UNACCESSIBLE: Story = {
  args: {
    __accessible: 2,
  },
};
export const UNKNOWN: Story = {
  args: {
    __accessible: 5,
  },
};
