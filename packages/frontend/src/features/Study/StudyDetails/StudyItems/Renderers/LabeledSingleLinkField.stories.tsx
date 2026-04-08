import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import LabeledSingleLinkField from './LabeledSingleLinkField';
import { JSONValue } from '@gen3/core';

const meta = {
  component: LabeledSingleLinkField as any,
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
    linkValue: { control: 'text' },
    labelText: { control: 'text' },
  },
} satisfies Meta<typeof LabeledSingleLinkField>;

export default meta;

type Story = StoryObj<typeof meta>;

const render = (args: { linkValue: JSONValue; labelText?: string }) =>
  LabeledSingleLinkField(args.linkValue, args.labelText);

export const Default: Story = {
  render,
  args: {
    linkValue: 'https://example.com',
    labelText: 'Website',
  },
};

export const NoLabel: Story = {
  render,
  args: {
    linkValue: 'https://example.com/page',
    labelText: '',
  },
};

export const EmptyValue: Story = {
  render,
  args: {
    linkValue: '',
    labelText: 'Empty',
  },
};

export const InvalidType: Story = {
  render,
  args: {
    linkValue: { not: 'a string' } as unknown as JSONValue,
    labelText: 'Invalid',
  },
};
