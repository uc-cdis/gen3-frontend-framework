import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import AnalysisCard from './AnalysisCard';

const meta = {
  component: AnalysisCard,
  parameters: {
    deepControls: { enabled: true },
  },
  decorators: [
    (Story) => (
      <div className="bg-primary-lighter p-4">
        {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AnalysisCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args:
      {
        title: "Proteome Data Commons (PDC) Clustergram",
        type: "notebook",
        icon: "/images/apps/icons/jupyter.png",
        image: "/images/apps/PDC_clustergram.png",
        description: "Use the Proteome Data Commons (PDC) API to retrieve protein relative expression data for a CPTAC study. The PDC uses values produced by the Common Data Analysis Pipeline (CDAP). The results are intended to help identify clusters of samples (tumors) displaying similar patterns of protein expression.",
        loginRequired: false,
        href: "notebook",
        btnText: "Show Analysis"
  },
};
