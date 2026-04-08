import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import Label from './Label';
import { JSONValue } from '@gen3/core';

const meta = {
  component: Label as any,
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
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args: { input: string }) => Label(args.input),
  args: {
    input: 'Label Test String',
  } as unknown as never,
};
