import type { Meta, StoryObj } from '@storybook/nextjs';

import StatusBoard from './StatusBoard';

const meta = {
  component: StatusBoard,
} satisfies Meta<typeof StatusBoard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
