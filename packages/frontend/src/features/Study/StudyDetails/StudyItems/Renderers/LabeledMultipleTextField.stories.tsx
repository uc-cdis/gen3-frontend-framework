import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import LabeledMultipleTextField from './LabeledMultipleTextField';
import { JSONValue } from '@gen3/core';

const meta = {
  component: LabeledMultipleTextField as any, // signature: (fieldsText: JSONValue, labelText?: string) => ReactElement
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
    fieldsText: { control: 'object' },
    labelText: { control: 'text' },
  },
} satisfies Meta<typeof LabeledMultipleTextField>;

export default meta;

type Story = StoryObj<typeof meta>;

const render = (args: { fieldsText: JSONValue; labelText?: string }) =>
  LabeledMultipleTextField(args.fieldsText, args.labelText);

export const Default: Story = {
  render,
  args: {
    fieldsText: ['First item', 'Second item'],
    labelText: 'Study details',
  } as unknown as never,
};

export const SingleItem: Story = {
  render,
  args: {
    fieldsText: ['Only one field'],
    labelText: 'Primary',
  } as unknown as never,
};

export const MultipleItems: Story = {
  render,
  args: {
    fieldsText: ['Alpha', 'Beta', 'Gamma', 'Delta'],
    labelText: 'List',
  } as unknown as never,
};

export const Empty: Story = {
  render,
  args: {
    fieldsText: [],
    labelText: 'Nothing',
  } as unknown as never,
};
