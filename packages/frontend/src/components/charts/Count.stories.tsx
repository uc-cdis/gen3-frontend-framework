import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Count from './Count';

const meta = {
  component: Count,
} satisfies Meta<typeof Count>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: [],
    total: 5,
    xLabel: 'Projects',
  },
};
