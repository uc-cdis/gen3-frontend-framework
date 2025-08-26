import type { Meta, StoryObj } from '@storybook/nextjs';

import DataLibraryActionButton from './DataLibraryActionButton';

const meta = {
  title: 'Gen3 components/AddToDataLibraryButton',
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
