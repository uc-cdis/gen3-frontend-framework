import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import LinkFieldWithOptionalLabel from './LinkFieldWithOptionalLabel';

const meta = {
  component: LinkFieldWithOptionalLabel as any,
  decorators: [
    (Story) => (
      <div className="bg-base-lighter p-4">
        <Story />
      </div>
    ),
  ],
  parameters: { deepControls: { enabled: true } },
  argTypes: {
    linkValue: { control: 'text' },
    linkText: { control: 'text' },
  } as any,
} satisfies Meta<typeof LinkFieldWithOptionalLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

const render = (args: any) =>
  LinkFieldWithOptionalLabel(args.linkValue, args.linkText);

export const Default: Story = {
  render,
  args: { linkValue: 'https://example.com', linkText: 'Example' },
};
