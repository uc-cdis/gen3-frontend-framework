import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import LabeledNumberField from './LabeledNumberField';
import { JSONValue } from '@gen3/core';

const meta = {
  component: LabeledNumberField as any, // signature: (fieldValue: JSONValue, labelText?: string) => ReactElement
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
    fieldValue: { control: 'number' },
    labelText: { control: 'text' },
  },
} satisfies Meta<typeof LabeledNumberField>;

export default meta;

type Story = StoryObj<typeof meta>;

const render = (args: { fieldValue: JSONValue; labelText?: string }) =>
  LabeledNumberField(args.fieldValue, args.labelText);

export const Number: Story = {
  render,
  args: {
    fieldValue: 123456,
    labelText: 'Count',
  } as unknown as never,
};
