import type { Meta, StoryObj } from '@storybook/nextjs';

import CohortActionButton from './CohortActionButton';
import React from 'react';

const actionFunction = async (
  _params: Record<string, any>,
  _done?: () => void,
  _onError?: (error: Error) => void,
  _onAbort?: () => void,
  _signal?: AbortSignal,
  _onCompleted?: (data: any) => void,
) => {};

const meta = {
  component: CohortActionButton,
  decorators: [
    (Story) => (
      <div className="bg-base-lightest p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CohortActionButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    activeText: 'Cancel',
    inactiveText: 'Download',
    actionFunction: actionFunction,
    actionArgs: {},
    showLoading: false,
  },
};
