import type { Meta, StoryObj } from '@storybook/nextjs';

import Custom403Page from './Custom403Page';

const meta = {
  title: 'Pages/403',
  component: Custom403Page,
} satisfies Meta<typeof Custom403Page>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: '403 Page',
  },
};
