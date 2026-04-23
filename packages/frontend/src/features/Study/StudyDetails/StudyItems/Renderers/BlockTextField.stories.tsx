import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import BlockTextField from './BlockTextField';
import { JSONValue } from '@gen3/core';

const meta = {
  component: BlockTextField as any,
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
  argTypes: {
    fieldValue: { control: 'object' },
  },
} satisfies Meta<typeof BlockTextField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args: { fieldValue: JSONValue }) => BlockTextField(args.fieldValue),
  args: { fieldValue: 'Arbitrary String' } as unknown as never,
};

export const LongText: Story = {
  render: (args: { fieldValue: JSONValue }) => BlockTextField(args.fieldValue),
  args: {
    fieldValue:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.',
  } as unknown as never,
};

export const ArrayValue: Story = {
  render: (args: { fieldValue: JSONValue }) => BlockTextField(args.fieldValue),
  args: { fieldValue: ['one', 'two', { nested: 'value' }] } as unknown as never,
};

export const ObjectValue: Story = {
  render: (args: { fieldValue: JSONValue }) => BlockTextField(args.fieldValue),
  args: {
    fieldValue: { key1: 'value1', key2: 2, key3: true },
  } as unknown as never,
};
