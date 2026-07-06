import type { Meta, StoryObj } from '@storybook/nextjs';

import DataToolsRail from './DataToolsRail';

const meta = {
  title: 'Workspace Components/DataRailsPanel',
  component: DataToolsRail,
} satisfies Meta<typeof DataToolsRail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
