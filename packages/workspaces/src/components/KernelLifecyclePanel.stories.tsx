import type { Meta, StoryObj } from '@storybook/nextjs';

import KernelLifecyclePanel from './KernelLifecyclePanel';

const meta = {
  component: KernelLifecyclePanel,
} satisfies Meta<typeof KernelLifecyclePanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    kernels: [
      {
        kernelId: "123",
        kernelName: "kernel1",
        executionState: "yes",
        staleState: "healthy"
      }
    ],
    kernelSpecs: [
      {
        name: "kernel1",
        displayName: "Kernel 1",
        cpu: "4",
        memory: "4",
        gpuType: "integrated",
        costPerHour: 50,
      }
    ],
    onRunStaleReap: () => {},
    onLaunchKernel: () => {},
    onOpenNotebook: () => {},
    onTerminateKernel: () => {},
    notice: "ATTENTION"
  }
};
