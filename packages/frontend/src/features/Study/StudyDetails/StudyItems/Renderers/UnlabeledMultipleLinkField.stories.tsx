import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import UnlabeledMultipleLinkField from './UnlabeledMultipleLinkField';
import { JSONValue } from '@gen3/core';

const meta = {
  component: UnlabeledMultipleLinkField as any,
  decorators: [
    (Story) => (
      <div className="bg-base-lighter p-4">
        <Story />
      </div>
    ),
  ],
  parameters: { deepControls: { enabled: true } },
  argTypes: {
    fieldData: { control: 'object' },
    fieldName: { control: 'text' },
  },
} satisfies Meta<typeof UnlabeledMultipleLinkField>;

export default meta;

type StoryArgs = { fieldData: JSONValue; fieldName?: string };

const render = (args: StoryArgs) =>
  UnlabeledMultipleLinkField(args.fieldData, args.fieldName);

const sampleLinks = [
  [
    { title: 'First Resource', link: 'https://example.com/first' },
    { title: 'Second Resource', link: 'https://example.com/second' },
  ],
] as unknown as JSONValue; // component expects an array with the links at index 0

export const Default: any = {
  render,
  args: {
    fieldData: sampleLinks,
    fieldName: 'resources',
  },
};

export const EmptyArray: any = {
  render,
  args: {
    fieldData: [] as unknown as JSONValue,
    fieldName: 'empty',
  },
};

export const InvalidData: any = {
  render,
  args: {
    fieldData: { not: 'an array' } as unknown as JSONValue,
    fieldName: 'invalid',
  },
};
