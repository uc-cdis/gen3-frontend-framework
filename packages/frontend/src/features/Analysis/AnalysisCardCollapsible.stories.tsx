import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';

import AnalysisCardCollapsible from './AnalysisCardCollapsible';

const meta = {
  component: AnalysisCardCollapsible,
  decorators: [
    (Story) => (
      <div className="w-[200px]">
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
} satisfies Meta<typeof AnalysisCardCollapsible>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    descriptionVisible: false,
    setDescriptionVisible: () => {},
    title: 'Mutation Frequency',
    description:
      'Visualize most frequently mutated genes and somatic mutations.',
    icon: '/images/apps/MutationFrequency.svg',
    appId: "mutation_freq",
    hasDemo: false,
    href: '/',
    loginRequired: false,
    type: 'application',
    useCountHook: () => ({ data: 400, isFetching: false, isSuccess: true }),
  },
};
