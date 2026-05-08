import type { Meta, StoryObj } from '@storybook/nextjs';

import CodingAssistantPanel from './CodingAssistantPanel';

const meta = {
  component: CodingAssistantPanel,
} satisfies Meta<typeof CodingAssistantPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};
