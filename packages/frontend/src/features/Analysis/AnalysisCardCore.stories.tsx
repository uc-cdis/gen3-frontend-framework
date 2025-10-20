import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';

import AnalysisCardCore from './AnalysisCardCore';

const meta = {
  component: AnalysisCardCore,
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
        <Story />
      </div>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
    }
  }
} satisfies Meta<typeof AnalysisCardCore>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Mutation Frequency',
    description:
      'Visualize most frequently mutated genes and somatic mutations.',
    icon: '/images/apps/MutationFrequency.svg',
    appId: "mutation_freq",
    hasDemo: false,
    href: '/',
    loginRequired: false,
    type: 'application',
  },
};
