import type { Meta, StoryObj } from '@storybook/nextjs';

import MicroContainerPanel from './MicroContainerPanel';
import React from 'react';
import { MicroContainerProvider } from '../providers/MicroContainerProvider';

const meta = {
  title: 'Workspace Components/MicroContainerPanel',
  component: MicroContainerPanel,
  decorators: [
    (Story) => (
      <div className="bg-base-lightest p-4">
        <MicroContainerProvider enabled={true}>
          <Story />
        </MicroContainerProvider>
      </div>
    ),
  ],
} satisfies Meta<typeof MicroContainerPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    compact: false,
  },
};
