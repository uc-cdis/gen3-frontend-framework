import type { Meta, StoryObj } from '@storybook/nextjs';

import MicroContainerReduxPanel from './MicroContainerReduxPanel';
import React from 'react';
import { MicroContainerReduxProvider } from '../providers/MicroContainerReduxProvider';

const meta = {
  title: 'Workspace Components/MicroContainerPanel',
  component: MicroContainerReduxPanel,
  decorators: [
    (Story) => (
      <div className="bg-base-lightest p-4">
        <MicroContainerReduxProvider enabled={true}>
          <Story />
        </MicroContainerReduxProvider>
      </div>
    ),
  ],
} satisfies Meta<typeof MicroContainerReduxPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    compact: false,
  },
};
