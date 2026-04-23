import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import LabeledMultipleLinkField from './LabeledMultipleLinkField';
import { JSONValue } from '@gen3/core';

const meta = {
  component: LabeledMultipleLinkField as any,
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
    value: { control: 'object' },
    labelText: { control: 'text' },
  },
} satisfies Meta<typeof LabeledMultipleLinkField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args: { value: JSONValue; labelText?: string }) =>
    LabeledMultipleLinkField(args.value, args.labelText),
  args: {
    value: 'https://example.com',
    labelText: 'Link',
  } as unknown as never,
};

export const MultipleStrings: Story = {
  render: (args: { value: JSONValue; labelText?: string }) =>
    LabeledMultipleLinkField(args.value, args.labelText),
  args: {
    value: [
      'https://one.example',
      'https://two.example',
      'https://three.example',
    ],
    labelText: 'Related link',
  } as unknown as never,
};

export const ArrayOfLinkTitleObjects: Story = {
  render: (args: { value: JSONValue; labelText?: string }) =>
    LabeledMultipleLinkField(args.value, args.labelText),
  args: {
    value: [
      { link: 'https://one.example', title: 'First' },
      { link: 'https://two.example', title: 'Second' },
    ],
    labelText: 'Resource',
  } as unknown as never,
};

export const EmptyValue: Story = {
  render: (args: { value: JSONValue; labelText?: string }) =>
    LabeledMultipleLinkField(args.value, args.labelText),
  args: {
    value: '',
    labelText: 'Link',
  } as unknown as never,
};
