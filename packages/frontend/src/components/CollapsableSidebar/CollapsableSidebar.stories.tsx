import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';
import { CollapsableSidebar } from './CollapsableSidebar';
import { Group, Text } from '@mantine/core';

const meta: Meta<typeof CollapsableSidebar> = {
  title: 'Gen3 components/CollapsableSidebar',
  component: CollapsableSidebar,
};

export default meta;
type Story = StoryObj<typeof CollapsableSidebar>;

export const Primary: Story = {
  args: {
    expanded: true,
    children: (
      <Group>
        <Text>Inside</Text>
      </Group>
    ),
  },
};
