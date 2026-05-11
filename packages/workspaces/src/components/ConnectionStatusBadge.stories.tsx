import type { Meta, StoryObj } from '@storybook/nextjs';

import ConnectionStatusBadge from './ConnectionStatusBadge';

const meta = {
  title: "Workspace Components/ConnectionStatusBadge",
  component: ConnectionStatusBadge,
} satisfies Meta<typeof ConnectionStatusBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    state: "attaching",
    onRetry: () => {}
  }
};
