import type { Meta, StoryObj } from '@storybook/react';
import JobsList from './JobsList';
import { SowerJobStage, SowerJobStatus } from '@gen3/core';

// Sample job data
const mockJobs = {
  'job-1': {
    jobId: 'job-1',
    name: 'Data Processing',
    status: 'Running' as SowerJobStatus,
    created: 1748880765407,
    updated: 1748880765407,
    stage: 1 as SowerJobStage,
  },
  'job-2': {
    jobId: 'job-2',
    name: 'Model Training',
    status: 'Completed' as SowerJobStatus,
    created: 1748880765407,
    updated: 1748880765407,
    stage: 2 as SowerJobStage,
  },
  'job-3': {
    jobId: 'job-3',
    name: 'Data Import',
    status: 'Failed' as SowerJobStatus,
    created: 1748880765407,
    updated: 1748880765407,
    stage: 1 as SowerJobStage,
  },
};

const meta = {
  title: 'Features/Jobs/JobsList',
  component: JobsList,
} satisfies Meta<typeof JobsList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    jobs: mockJobs,
    size: 'sm',
  },
};
