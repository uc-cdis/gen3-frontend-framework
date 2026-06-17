import type { Meta, StoryObj } from '@storybook/nextjs';

import InfrastructureRightPanel from './InfrastructureRightPanel';
import { KERNEL_DEFAULT_ARGS } from './KernelLifecyclePanel/KernelLifecyclePanel.stories';

const meta = {
  title: 'Workspace Components/InfrastructureRightPanel',
  component: InfrastructureRightPanel,
} satisfies Meta<typeof InfrastructureRightPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    kernelPanel: KERNEL_DEFAULT_ARGS,
    upgradePanel: {
      currentTier: 'free',
    },
  },
};
