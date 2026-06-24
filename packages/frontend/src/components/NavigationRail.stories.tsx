import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { CartIcon, PersonIcon } from '../types/icons';
import NavigationRail, { NavRailItem } from './NavigationRail';

const railButtons: NavRailItem[] = [
  {
    label: 'Cart',
    component: <div>Cart Panel</div>,
    icon: <CartIcon size={20} aria-hidden="true" />,
  },
  {
    label: 'Person',
    component: <div>Person Panel</div>,
    icon: <PersonIcon size={20} aria-hidden="true" />,
  },
];

const meta = {
  component: NavigationRail,
  decorators: [
    (Story) => (
      <div className="bg-base-lightest p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NavigationRail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: railButtons,
    label: 'Navigation',
    defaultValue: railButtons[0].label,
  },
};
