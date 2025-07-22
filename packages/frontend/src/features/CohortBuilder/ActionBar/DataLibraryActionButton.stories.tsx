import type { Meta, StoryObj } from '@storybook/react';

import DataLibraryActionButton from './DataLibraryActionButton';

const meta = {
  component: DataLibraryActionButton,
  parameters: {
    deepControls: { enabled: true },
  },
} satisfies Meta<typeof DataLibraryActionButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Download Action',
    tooltip: 'Download action tooltip',
  },
};
