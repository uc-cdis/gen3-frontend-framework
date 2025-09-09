import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { CartIcon, PersonIcon } from '../types/icons';
import { SegmentedControlItem, Tooltip } from '@mantine/core';
import SegmentedControl from './SegmentedControl';

const chartButtons: SegmentedControlItem[] = [
  {
    value: 'cart',
    label: (
      <Tooltip label="Cart" position="bottom-end" withArrow arrowSize={7}>
        <div
          data-testid="button-test-cart"
          role="button"
          aria-label={`Select cart`}
        >
          <CartIcon size={20} aria-hidden="true" />
        </div>
      </Tooltip>
    ),
  },
  {
    value: 'person',
    label: (
      <Tooltip label={'Copy Plot'} withArrow arrowSize={7}>
        <div
          data-testid="button-test-person"
          role="button"
          aria-label={`Select person`}
        >
          <PersonIcon size={20} aria-hidden="true" />
        </div>
      </Tooltip>
    ),
  },
];

const meta = {
  component: SegmentedControl,
  decorators: [
    (Story) => (
      <div className="bg-base-lightest p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SegmentedControl>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    padding: 1,
    data: chartButtons,
  },
};
