import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { Badge } from '@mantine/core';

import TopBar from './TopBar';

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
        rightIcon: 'gen3:video',
        href: '/',
        name: 'Video Guides',
      },
      {
        rightIcon: 'gen3:feedback',
        href: '/',
        name: 'Send Feedback',
      },
      {
        rightIcon: 'gen3:documentation',
        href: '/',
        name: 'Documentation',
      },
      {
        rightIcon: 'gen3:library',
        href: '/',
        name: 'My Data Library',
        // eslint-disable-next-line react/react-in-jsx-scope
        component: (
          <Badge color="primary.4" className="mx-2">
            Test
          </Badge>
        ),
      },
    ],
    loginButtonVisibility: 'visible' as any,
    classNames: {
      divider: 'border-base-min border-1',
      login: 'hover:border-base-max',
    },
    itemClassnames: {
      button: 'hover:border-base-max',
    },
  },
};
