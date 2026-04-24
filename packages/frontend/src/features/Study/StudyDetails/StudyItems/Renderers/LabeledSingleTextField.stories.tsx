import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import LabeledSingleTextField from './LabeledSingleTextField';
import { JSONValue } from '@gen3/core';

const meta = {
  component: LabeledSingleTextField as any,
  decorators: [
    (Story) => (
      <div className="bg-base-lighter p-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    deepControls: { enabled: true },
  },
  argTypes: {
    fieldValue: { control: 'text' },
    fieldLabel: { control: 'text' },
    params: { control: 'object' },
  },
} satisfies Meta<typeof LabeledSingleTextField>;

export default meta;

type Story = StoryObj<typeof meta>;

const render = (args: {
  fieldValue: JSONValue;
  fieldLabel?: string;
  params?: Record<string, any>;
}) => LabeledSingleTextField(args.fieldValue, args.fieldLabel, args.params);

export const Default: Story = {
  render,
  args: {
    fieldValue: 'Sample text',
    fieldLabel: 'Title',
    params: {},
  } as unknown as never,
};

export const WithStyleParam: Story = {
  render,
  args: {
    fieldValue: 'Styled text',
    fieldLabel: 'Label',
    params: { style: 'italic text-gray-600' },
  } as unknown as never,
};

export const EmptyOrInvalid: Story = {
  render,
  args: {
    fieldValue: { not: 'a string' } as unknown as JSONValue,
    fieldLabel: 'Invalid',
    params: {},
  } as unknown as never,
};
