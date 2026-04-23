import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import LabeledYearOfBirthRestricted from './LabeledYearOfBirthRestricted';
import { JSONValue } from '@gen3/core';

const meta = {
  component: LabeledYearOfBirthRestricted as any,
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
} satisfies Meta<typeof LabeledYearOfBirthRestricted>;

export default meta;

type Story = StoryObj<typeof meta>;

const render = (args: { fieldValue: JSONValue; fieldLabel?: string }) =>
  LabeledYearOfBirthRestricted(args.fieldValue, args.fieldLabel);

export const ModernYear: Story = {
  render,
  args: {
    fieldValue: '1988',
    fieldLabel: 'Year of birth',
  } as unknown as never,
};

export const YearBefore1935Restricted: Story = {
  render,
  args: {
    fieldValue: '1920',
    fieldLabel: 'Year of birth sent as 1920',
  } as unknown as never,
};

export const NonStringOrNumber: Story = {
  render,
  args: {
    fieldValue: { not: 'valid' } as unknown as JSONValue,
    fieldLabel: 'Invalid',
  } as unknown as never,
};
