import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '@mantine/core';
import { modals } from '@mantine/modals';

const MODAL_KEY = 'jobSaveOutputModal';

interface SowerJobSaveOutputStoryProps {
  title: string;
  message: string;
  jobId: string;
}

const JobSaveOutputStory = ({
  title,
  message,
  jobId,
}: SowerJobSaveOutputStoryProps): React.ReactElement => (
  <Button
    color="primary.5"
    onClick={() =>
      modals.openContextModal({
        modal: MODAL_KEY,
        title,
        innerProps: { message, jobId },
      })
    }
  >
    Open Save Job Output modal
  </Button>
);

const meta = {
  title: 'Modals/SowerJobSaveOutput',
  component: JobSaveOutputStory,
  args: {
    title: 'Job Save Output',
    message: 'The Sower job is complete. Download should start automatically.',
  },
} satisfies Meta<typeof JobSaveOutputStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    jobId: 'test-id',
    message: 'The Sower job is complete. Download should start automatically.',
  },
};

export const MessageWithLink: Story = {
  args: {
    jobId: 'test-id',
    message:
      'The Sower job failed with exit code 137 (out of memory). Reduce the size of the selected cohort or contact support with job ID 8f2c1d4e-77ab-4b0e-9a1c-3d5e2f6a9b10.',
  },
};
