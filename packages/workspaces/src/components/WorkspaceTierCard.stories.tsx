import type { Meta, StoryObj } from '@storybook/nextjs';

import WorkspaceTierCard from './WorkspaceTierCard';
import { WorkspaceTier } from './types';

const meta = {
  component: WorkspaceTierCard,
} satisfies Meta<typeof WorkspaceTierCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Default Card',
    tier: 'free',
    description:
      'Instant startup and lightweight notebooks directly in your browser.',
    features: ['Instant startup', 'Lightweight notebooks', 'Browser-based'],
    buttonLabel: 'Launch Local Workspace',
    onSelectTier: (_tier: WorkspaceTier) => null,
  },
};
