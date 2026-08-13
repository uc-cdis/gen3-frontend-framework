import React from 'react';
import type { Meta } from '@storybook/nextjs';
import TextField from './TextField';
import { JSONValue } from '@gen3/core';

const meta = {
  component: TextField as any,
  decorators: [
    (Story) => (
      <div className="bg-base-lighter p-4">
        <Story />
      </div>
    ),
  ],
  parameters: { deepControls: { enabled: true } },
  argTypes: {
    fieldValue: { control: 'text' },
    style: { control: 'text' },
  },
} satisfies Meta<typeof TextField>;

export default meta;

type StoryArgs = { fieldValue: JSONValue; style?: string };

const render = (args: StoryArgs) => TextField(args.fieldValue, args.style);

export const Default: any = {
  render,
  args: {
    fieldValue: 'Sample text for the field',
    style: '',
  },
};

export const WithStyle: any = {
  render,
  args: {
    fieldValue: 'Styled text',
    style: 'italic text-blue-600',
  },
};

export const EmptyString: any = {
  render,
  args: {
    fieldValue: '',
    style: '',
  },
};
