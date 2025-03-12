import type { Meta, StoryObj } from '@storybook/react';

import DataLibraryActionButton from './DataLibraryActionButton';

const meta = {
  component: DataLibraryActionButton,
} satisfies Meta<typeof DataLibraryActionButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
