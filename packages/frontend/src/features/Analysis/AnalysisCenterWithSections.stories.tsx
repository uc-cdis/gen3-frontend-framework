import type { Meta, StoryObj } from '@storybook/react';

import AnalysisCenterWithSections from './AnalysisCenterWithSections';

const meta = {
  component: AnalysisCenterWithSections,
  parameters: {
    deepControls: { enabled: true },
  },
} satisfies Meta<typeof AnalysisCenterWithSections>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sections: [
      {
        label: 'Core Tools',
        tools: [
          {
            title: 'Projects',
            type: 'application',
            hasDemo: false,
            loginRequired: false,
            description:
              'Explore the available projects and select those for further investigation and analysis.',
            icon: '/icons/apps/Projects.svg',
            href: '/',
            count: 1000,
            countUnits: 'Cases',
          },
          {
            title: 'Cohort Builder',
            type: 'application',
            hasDemo: false,
            loginRequired: false,
            description:
              'Build and define your custom cohorts using a variety of clinical and biospecimen features.',
            icon: '/icons/apps/CohortBuilder.svg',
            href: '/',
            count: 1000,
            countUnits: 'Cases',
          },
          {
            title: 'Repository',
            type: 'application',
            hasDemo: false,
            loginRequired: false,
            description:
              'Browse and download the files associated with your cohort for more sophisticated analysis.',
            icon: '/icons/apps/Repository.svg',
            href: '/',
            count: 1000,
            countUnits: 'Cases',
          },
        ],
      },
      {
        label: 'Analysis Tools',
        tools: [
          {
            title: 'Mutation Frequency',
            type: 'application',
            hasDemo: true,
            loginRequired: false,
            description:
              'Visualize most frequently mutated genes and somatic mutations.',
            icon: '/images/apps/MutationFrequency.svg',
            href: '/',
            count: 1000,
            countUnits: 'Cases',
          },
          {
            title: 'Cohort Comparison',
            type: 'application',
            hasDemo: true,
            loginRequired: false,
            description:
              'Display the survival analysis of your cohorts and compare characteristics such as gender, vital status and age at diagnosis.',
            icon: '/icons/apps/CohortComparison.svg',
            href: '/',
            count: 1000,
            countUnits: 'Cases',
          },
          {
            title: 'ProteinPaint',
            type: 'application',
            hasDemo: true,
            loginRequired: false,
            description:
              'Visualize mutations in protein-coding genes by consequence type and protein domain.',
            icon: '/icons/apps/ProteinPaint.svg',
            href: '/',
            count: 1000,
            countUnits: 'Cases',
          },
          {
            title: 'OncoMatrix',
            type: 'application',
            hasDemo: true,
            loginRequired: false,
            description:
              'Visualize the top most mutated cases and genes affected by high impact mutations in your cohort.',
            icon: '/icons/apps/OncoMatrix.svg',
            href: '/',
            count: 1000,
            countUnits: 'Cases',
          },
          {
            title: 'Set Operations',
            type: 'application',
            hasDemo: true,
            loginRequired: false,
            description:
              'Display a Venn diagram and compare/contrast your cohorts or sets of the same type.',
            icon: '/icons/apps/SetOperations.svg',
            href: '/',
            count: 1000,
            countUnits: 'Cases',
          },
        ],
      },
    ],
  },
};
