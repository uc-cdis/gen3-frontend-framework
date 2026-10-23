import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ModelCard from './ModelCard';

const meta = {
  component: ModelCard,
} satisfies Meta<typeof ModelCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    guid: '23b8c1e9-3924-46de-beb1-3b9046685257',
    name: 'wsi-slide-encoder',
    version: '0.9.2',
    license: 'cc-by-nc-4.0',
    createdAt: '2025-02-16T04:01:56Z',
    description:
      'Slide-level foundation model for gigapixel pathology images using long-context attention',
    tags: ['pathology', 'whole-slide-imaging', 'foundation-model'],
  },
};
