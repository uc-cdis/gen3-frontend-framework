import type { Meta, StoryObj } from '@storybook/nextjs';

import TierSelectorLanding from './TierSelectorLanding';

const meta = {
  component: TierSelectorLanding,
} satisfies Meta<typeof TierSelectorLanding>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    cards: [],
    onSelectTier: () => null,
  },
};
