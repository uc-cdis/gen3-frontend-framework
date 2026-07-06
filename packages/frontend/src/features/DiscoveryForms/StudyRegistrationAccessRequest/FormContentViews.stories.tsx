// FormContentViews.stories.tsx
import React from 'react';
import type { Meta } from '@storybook/nextjs';
import { FormContentViews } from './FormContentViews';
import { FormOutcome } from './types';

const mockFormBody = [
  {
    type: 'markdown',
    text: '## Study Registration Access Request',
  },
  {
    type: 'markdown',
    text: ' Please fill out this form to request and be approved for access to register your study with the HEAL Platform.',
    className: 'text-sm',
  },
  {
    type: 'TextInput',
    label: 'Study Name - Grant Number',
    initialValue: 'Example Study Name - Grant Number Value',
    disabled: true,
    required: true,
    variable: 'studyName',
  },
  {
    type: 'TextInput',
    label: 'Registrant First Name',
    required: true,
    variable: 'registrantFirstName',
  },
  {
    type: 'TextInput',
    label: 'Registrant Last Name',
    required: true,
    variable: 'registrantLastName',
  },
  {
    type: 'Email',
    label: 'E-mail Address',
    required: true,
    variable: 'emailAddress',
  },
  {
    type: 'TextInput',
    label: 'Affiliated Institution',
    required: true,
    variable: 'affiliatedInstituation',
  },
  {
    type: 'RadioGroup',
    label: 'Role on Project',
    text: [
      'Principal Investigator',
      'Co-Principal Investigator',
      'Co-Investigator',
      'Administrator',
      'Clinical Collaborator',
      'Clinical Coordinator',
      'Data Analyst',
      'Data Manager',
      'Research Coordinator',
      'Other...',
    ],
    required: true,
    variable: 'roleOnProject',
  },
];
const mockConfig = {
  remoteSupportService: {
    service: 'zenDesk',
    configuration: {
      zendeskSubdomainName: 'heal-support',
    },
  },
  disclaimer:
    'Information provided on this page will be used for correspondence regarding your request and may be shared with the NIH and/or the HEAL Data Stewards.',
  form: [
    {
      type: 'markdown',
      text: '## Study Registration Access Request',
    },
    {
      type: 'markdown',
      text: ' Please fill out this form to request and be approved for access to register your study with the HEAL Platform.',
      className: 'text-sm',
    },
    {
      type: 'TextInput',
      label: 'Study Name - Grant Number',
      initialValue: 'studyName',
      disabled: true,
      required: true,
      variable: 'studyName',
    },
    {
      type: 'TextInput',
      label: 'Registrant First Name',
      required: true,
      variable: 'registrantFirstName',
    },
    {
      type: 'TextInput',
      label: 'Registrant Last Name',
      required: true,
      variable: 'registrantLastName',
    },
    {
      type: 'Email',
      label: 'E-mail Address',
      required: true,
      variable: 'emailAddress',
    },
    {
      type: 'TextInput',
      label: 'Affiliated Institution',
      required: true,
      variable: 'affiliatedInstituation',
    },
    {
      type: 'RadioGroup',
      label: 'Role on Project',
      text: [
        'Principal Investigator',
        'Co-Principal Investigator',
        'Co-Investigator',
        'Administrator',
        'Clinical Collaborator',
        'Clinical Coordinator',
        'Data Analyst',
        'Data Manager',
        'Research Coordinator',
        'Other...',
      ],
      required: true,
      variable: 'roleOnProject',
    },
  ],
  success: {
    content: [
      {
        type: 'markdown',
        text: [
          '# Your access request has been submitted!',
          'Thank you for your submission. Requests take up to 1 business day to complete. You will be notified when approved. If you do not receive notification within 1 business day of your request, please reach out to [heal-support@gen3.org](mailto:heal-support@gen3.org).',
        ],
        className: 'text-center',
      },
    ],
    button: {
      variant: 'filled',
      href: '/Discovery',
      text: 'Go to Discovery Page',
    },
  },
  duplicateSubmission: {
    content: [
      {
        type: 'markdown',
        text: [
          '# A problem has occurred while submitting the request!',
          ' There is already a pending request for this user to access this study. We are processing your request. You will be notified when approved. If you do not receive notification within 1 business day of your initial request, please reach out to [heal-support@gen3.org](mailto:heal-support@gen3.org).',
        ],
        className: 'text-center',
      },
    ],
    button: {
      variant: 'filled',
      href: '/Discovery',
      text: 'Go to Discovery Page',
    },
  },
};

const meta: any = {
  title: 'DiscoveryForms/StudyRegistrationAccessRequest',
  component: FormContentViews,
  args: {
    studyUID: 'STUDY-123',
    formBody: mockFormBody as any,
    config: mockConfig,
    onSubmit: async (values) => alert(`Submitted ${JSON.stringify(values)}`),
    isLoading: false,
  },
  decorators: [
    (Story) => (
      <div className="flex justify-center items-center min-h-screen w-full box-border p-5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FormContentViews>;
export default meta;

export const PendingState = {
  args: {
    formOutcome: FormOutcome.pending,
  },
};

export const SuccessState = {
  args: {
    formOutcome: FormOutcome.success,
  },
};

export const LoadingState = {
  args: {
    isLoading: true,
  },
};

export const DuplicateSubmissionState = {
  args: {
    formOutcome: FormOutcome.duplicateSubmission,
    formError: 'A duplicate entry was found',
  },
};
