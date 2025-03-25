import type { Meta, StoryObj } from '@storybook/react';

import AnalysisCardCompact from './AnalysisCardCompact';

const meta = {
  component: AnalysisCardCompact,
} satisfies Meta<typeof AnalysisCardCompact>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Mutation Frequency',
    type: 'application',
    hasDemo: false,
    loginRequired: false,
    description:
      'Visualize most frequently mutated genes and somatic mutations.',
    icon: '/images/apps/MutationFrequency.svg',
    href: '/',
    count: 1000,
    countUnits: 'Cases',
  },
};
