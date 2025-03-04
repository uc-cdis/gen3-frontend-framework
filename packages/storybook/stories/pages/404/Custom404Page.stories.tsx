import type { Meta, StoryObj } from '@storybook/react';

import { Custom404Page } from '@gen3/frontend';

const meta = {
  title: 'Pages/404',
  component: Custom404Page,
} satisfies Meta<typeof Custom404Page>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Action',
  },
};
