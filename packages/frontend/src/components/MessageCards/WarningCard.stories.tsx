import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import WarningCard from './WarningCard';

const meta = {
  component: WarningCard,
} satisfies Meta<typeof WarningCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'Warning Message',
  },
};
