import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import SessionExpiringPanel from './SessionExpiringPanel';

const meta = {
  component: SessionExpiringPanel,
} satisfies Meta<typeof SessionExpiringPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    remainingMinutes: 0,
    onRenew: () => null,
    onLogout: () => null,
  },
};
