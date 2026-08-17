import type { Meta, StoryObj } from '@storybook/nextjs';

import { ServiceStatusCard } from './StatusCard';
import { Text } from '@mantine/core';

const meta = {
  component: ServiceStatusCard,
} satisfies Meta<typeof ServiceStatusCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Service',
    status: 'Status',
    timestamp: new Date(),
    additionalInfo: <Text c={'primary.4'}>Additional Info</Text>,
  },
};
