import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import DiscoveryActionButton from './DiscoveryActionButton';

const meta = {
  component: DiscoveryActionButton,
  parameters: {
    deepControls: { enabled: true },
  },
} satisfies Meta<typeof DiscoveryActionButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Download Action',
    tooltip: 'Download action tooltip',
  },
};
