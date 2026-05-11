import type { Meta, StoryObj } from '@storybook/nextjs';

import DataToolsPanel from './DataToolsPanel';

const meta = {
  component: DataToolsPanel,
} satisfies Meta<typeof DataToolsPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};
