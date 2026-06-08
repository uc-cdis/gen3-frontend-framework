import type { Meta, StoryObj } from '@storybook/nextjs';

import KernelLifecyclePanel from './KernelLifecylcePanel/KernelLifecyclePanel';
import { KernelLifecyclePanelProps } from '../workspace/HostedWorkspace';

const meta = {
  title: 'Workspace Components/KernelLifecyclePanel',
  component: KernelLifecyclePanel,
} satisfies Meta<typeof KernelLifecyclePanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const KERNEL_DEFAULT_ARGS: KernelLifecyclePanelProps = {
  kernels: [
    {
      kernelId: '123',
      kernelName: 'kernel1',
      executionState: 'yes',
      staleState: 'healthy',
    },
  ],
  kernelSpecs: [
    {
      name: 'kernel1',
      displayName: 'Kernel 1',
      cpu: '4',
      memory: '4',
      gpuType: 'integrated',
      costPerHour: 50,
    },
  ],
  onRunStaleReap: () => {},
  onLaunchKernel: () => {},
  onOpenNotebook: () => {},
  onTerminateKernel: () => {},
  notice: 'ATTENTION',
};

export const Default: Story = {
  args: KERNEL_DEFAULT_ARGS,
};
