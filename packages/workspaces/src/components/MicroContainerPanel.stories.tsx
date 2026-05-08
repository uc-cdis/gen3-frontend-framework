import type { Meta, StoryObj } from '@storybook/nextjs';

import MicroContainerPanel from './MicroContainerPanel';

const meta = {
  component: MicroContainerPanel,
} satisfies Meta<typeof MicroContainerPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: "launching",
    lastError: "404 not found",
    onLaunch: () => {},
    onTerminate: () => {},
  }
};
