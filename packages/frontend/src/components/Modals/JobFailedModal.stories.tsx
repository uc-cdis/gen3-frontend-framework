import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '@mantine/core';
import { modals } from '@mantine/modals';

const MODAL_KEY = 'jobFailedModal';

interface SowerJobFailedStoryProps {
  title: string;
  message: string;
}

const JobFailedStory = ({
  title,
  message,
}: SowerJobFailedStoryProps): React.ReactElement => (
  <Button
    color="primary.5"
    onClick={() =>
      modals.openContextModal({
        modal: MODAL_KEY,
        title,
        innerProps: { message },
      })
    }
  >
    Open Job Failed modal
  </Button>
);

const meta = {
  title: 'Modals/SowerJobFailed',
  component: JobFailedStory,
  args: {
    title: 'Job Failed',
    message: 'The Sower job failed to complete.',
  },
} satisfies Meta<typeof JobFailedStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongMessage: Story = {
  args: {
    message:
      'The Sower job failed with exit code 137 (out of memory). Reduce the size of the selected cohort or contact support with job ID 8f2c1d4e-77ab-4b0e-9a1c-3d5e2f6a9b10.',
  },
};
