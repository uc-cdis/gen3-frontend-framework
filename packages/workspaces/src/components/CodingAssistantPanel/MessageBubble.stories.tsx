import type { Meta, StoryObj } from '@storybook/nextjs';

import MessageBubble from './MessageBubble';

const meta = {
  title: "Workspace Components/MessageBubble",
  component: MessageBubble,
} satisfies Meta<typeof MessageBubble>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: {
      id: "1",
      role: "assistant",
      content: "Hi",
      streaming: true
    },
    onInsert: () => {}
  }
};
