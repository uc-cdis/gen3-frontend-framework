// FormContentViews.stories.tsx
import React from 'react';
import type { Meta } from '@storybook/react';
import { FormContentViews } from './FormContentViews';
import { FormOutcome } from './types';

const mockFormBody = [
  { name: 'name', label: 'Full Name', type: 'text', initialValue: '' },
  {
    name: 'study',
    label: 'Study Name',
    type: 'text',
    initialValue: 'Sample Study',
  },
];

const mockConfig = {
  [FormOutcome.success]: { title: 'Success!', message: 'Approved.' },
  [FormOutcome.duplicateSubmission]: {
    title: 'Hold on',
    message: 'Already sent.',
  },
};

const meta: any = {
  title: 'pages/StudyForms/StudyRegistrationAccessRequest',
  component: FormContentViews,
  args: {
    studyUID: 'STUDY-123',
    formBody: mockFormBody as any,
    config: mockConfig,
    onSubmit: async (values) => alert(`Submitted ${values}`),
    isLoading: false,
  },
} satisfies Meta<typeof FormContentViews>;

export default meta;

// 1. Pending / Idle State (Shows the raw form)
export const PendingState = {
  args: {
    formOutcome: FormOutcome.pending,
  },
};

// 2. Success State (Instantly swaps to show the success outcome component)
export const SuccessState = {
  args: {
    formOutcome: FormOutcome.success,
  },
};

// 3. Duplicate Submission State (Instantly swaps to show error outcome component)
export const DuplicateState = {
  args: {
    formOutcome: FormOutcome.duplicateSubmission,
    formError: 'A duplicate entry was detected by the system.',
  },
};
