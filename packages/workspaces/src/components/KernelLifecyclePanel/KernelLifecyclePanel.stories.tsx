import type { Meta, StoryObj } from '@storybook/nextjs';

import KernelLifecyclePanel, {
  KernelLifecyclePanelProps,
} from './KernelLifecyclePanel';

const meta = {
  title: 'Workspace Components/KernelLifecyclePanel',
  component: KernelLifecyclePanel,
} satisfies Meta<typeof KernelLifecyclePanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const KERNEL_DEFAULT_ARGS: KernelLifecyclePanelProps = {
  onRunStaleReap: () => {},
  onLaunchKernel: () => {},
  onOpenNotebook: () => {},
  onTerminateKernel: () => {},
  notice: 'ATTENTION',
};

export const Default: Story = {
  args: KERNEL_DEFAULT_ARGS,
};
