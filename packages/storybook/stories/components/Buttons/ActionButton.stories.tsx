import type { Meta, StoryObj } from '@storybook/react';
import { ActionButton } from '@gen3/frontend';

const meta = {
  title: 'Components/Buttons/ActionButton',
  component: ActionButton,
} satisfies Meta<typeof ActionButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Action',
  },
};
