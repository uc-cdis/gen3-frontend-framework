import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ErrorCard from './ErrorCard';

const meta = {
  component: ErrorCard,
} satisfies Meta<typeof ErrorCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'This is an Error Message',
  },
};
