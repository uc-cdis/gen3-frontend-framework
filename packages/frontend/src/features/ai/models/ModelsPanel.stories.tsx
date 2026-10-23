import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ModelsPanel } from './ModelsPanel';
import sampleModels from './data/models.json';

const meta = {
  component: ModelsPanel,
} satisfies Meta<typeof ModelsPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    models: sampleModels,
  },
};
