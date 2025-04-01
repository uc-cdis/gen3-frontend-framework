import type { Meta, StoryObj } from '@storybook/react';

import { IconButton } from './IconButton';

const meta = {
  title: 'Features/Navigation/TopBar/IconButton',
  component: IconButton,
  parameters: {
    deepControls: { enabled: true },
  },
  argTypes: {
    // 👇 All Button stories expect a label arg
    tooltip: {
      control: 'text',
      description: 'Tooltip to show when hovering over the button',
    },
    iconSize: {
      control: 'text',
      type: 'string',
      description: 'size of the icons: sm, md, lg, xl',
    },
    rightIcon: {
      control: 'text',
      type: 'string',
      description: 'registered icon name: e.g gen3:download',
    },
    leftIcon: {
      control: 'text',
      type: 'string',
      description: 'registered icon name: e.g gen3:send',
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'Top Navigation Item',
    tooltip: 'Navigation link in the TopBar component',
    leftIcon: 'gen3:download',
    rightIcon: 'gen3:send',
  },
};
