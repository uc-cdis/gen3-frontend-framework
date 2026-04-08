import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import LabeledParagraph from './LabeledParagraph';
import { JSONValue } from '@gen3/core';

const meta = {
  component: LabeledParagraph as any, // signature: (fieldValue: JSONValue, fieldLabel?: string) => ReactElement
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
  },
} satisfies Meta<typeof LabeledParagraph>;

export default meta;

type Story = StoryObj<typeof meta>;

const render = (args: { fieldValue: JSONValue; fieldLabel?: string }) =>
  LabeledParagraph(args.fieldValue, args.fieldLabel);

export const Default: Story = {
  render,
  args: {
    fieldValue:
      'This is a paragraph. This is a paragraph. This is a paragraph. This is a paragraph. ',
    fieldLabel: 'Summary',
  } as unknown as never,
};

export const NoFieldLabel: Story = {
  render,
  args: {
    fieldValue: 'Paragraph without a label should render just the text.',
    fieldLabel: '',
  } as unknown as never,
};

export const EmptyFieldValue: Story = {
  render,
  args: {
    fieldValue: '',
    fieldLabel: 'Empty',
  } as unknown as never,
};
