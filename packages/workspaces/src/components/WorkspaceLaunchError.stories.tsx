import { fn } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import WorkspaceLaunchError from './WorkspaceLaunchError';

const meta = {
  component: WorkspaceLaunchError,
} satisfies Meta<typeof WorkspaceLaunchError>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onRetry: fn(),
    onChooseAnother: fn(),
    workspaceName: '',
    reason: 'Payment is needed',
  },
};
