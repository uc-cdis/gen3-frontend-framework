import type { Meta, StoryObj } from '@storybook/react';

import { TruncatedStringWithTooltip } from './TruncatedStringWithTooltip';

const meta = {
  title: 'Gen3 components/TruncatedStringWithTooltip',
  component: TruncatedStringWithTooltip,
  parameters: {
    deepControls: { enabled: true },
  },
} satisfies Meta<typeof TruncatedStringWithTooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 'This is a really long string that needs truncation',
    params: {
      maxLength: 5,
      valueIfNotAvailable: 'Not Set',
    },
  },
};
