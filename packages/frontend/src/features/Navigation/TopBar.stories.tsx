import type { Meta, StoryObj } from '@storybook/react';

import TopBar from './TopBar';
import { LoginButtonVisibility } from '../../components/Login/types';

const meta = {
  component: TopBar,
  title: 'Features/Navigation/TopBar',
  parameters: {
    deepControls: { enabled: true },
  },
} satisfies Meta<typeof TopBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      {
        rightIcon: 'gen3:upload',
        href: '/submission',
        name: 'Browse Data',
      },
      {
        href: 'https://gen3.org/resources/user/',
        name: 'Documentation',
      },
    ],
    loginButtonVisibility: LoginButtonVisibility.Visible,
    classNames: {
      divider: 'border-primary',
    },
  },
};
