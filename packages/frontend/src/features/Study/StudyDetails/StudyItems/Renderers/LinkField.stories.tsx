import React from 'react';
import type { Meta } from '@storybook/nextjs';
import LinkField from './LinkField';

const meta = {
  component: LinkField as any,
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
  } as unknown as never,
} satisfies Meta<typeof LinkField>;

export default meta;

const render = (args: { linkValue: string }) => LinkField(args.linkValue);

export const Default: any = {
  render,
  args: {
    linkValue: 'https://example.com',
  } as unknown as never,
};

export const Empty: any = {
  render,
  args: {
    linkValue: '',
  } as unknown as never,
};
