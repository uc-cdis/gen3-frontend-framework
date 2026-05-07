import type { Meta, StoryObj } from '@storybook/nextjs';

import UpgradeActionsPanel from './UpgradeActionsPanel';

const meta = {
  component: UpgradeActionsPanel,
} satisfies Meta<typeof UpgradeActionsPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentTier: "free",
    onUpgradeToRemote: () => {},
    onRequestQuotaIncrease: () => {},
    onOpenBillingSupport: () => {},
  }
};
