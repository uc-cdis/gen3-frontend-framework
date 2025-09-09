import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';

import AnalysisCardCompact from './AnalysisCardCompact';

const meta = {
  component: AnalysisCardCompact,
  decorators: [
    (Story) => (
      <div className="bg-primary-lighter p-4">
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
