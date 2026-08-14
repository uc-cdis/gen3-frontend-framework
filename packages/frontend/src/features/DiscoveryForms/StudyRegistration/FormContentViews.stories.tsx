import React from 'react';
import { FormContentViews } from './FormContentViews';
import { FormOutcome } from './types';
import type { FormPropsBody } from '../../../components/Content/Form';
import type { Meta } from '@storybook/nextjs';

const mockFormBody = [
  {
    type: 'markdown',
    text: '## Registration Information',
  },
  {
    type: 'Select',
    label: 'Study',
    initialValue: 'HDP01266',
    required: true,
    dropdownData: [
      {
        label:
          '1R43AR082729-01 : Ultrasound Stimulated Chondrogenic Stem Cell Therapy for Osteoarthritis : 10701506',
        value: 'HDP01266',
      },
      {
        label:
          '1R18EB035005-01 : Development of A Focused Ultrasound Device for Noninvasive, Peripheral Nerve Blockade to Manage Acute Pain : 10740796',
        value: 'HDP01267',
      },
      {
        label:
          '3U01OD033241-01S2 : Culturally-responsive community-driven substance use recovery for Black and Latinx populations : 10645536',
        value: 'HDP01268',
      },
    ],
    variable: 'study_id',
  },
  {
    type: 'CedarUserUUID',
    label: 'CEDAR User UUID',
    required: true,
    variable: 'cedar_uuid',
  },
  {
    type: 'markdown',
    className: 'text-sm mb-10 !mt-0',
    text: [
      '[Get CEDAR User UUID](https://cedar.metadatacenter.org/)',
      'A CEDAR user UUID is required in this process so the created CEDAR instances can be shared with you. We do not save this ID on the platform',
    ],
  },
  {
    type: 'ClinicalTrialID',
    label: 'ClinicalTrials.gov ID',
    variable: 'clinical_trials_id',
  },
  {
    type: 'markdown',
    text: '## Repository Information',
  },
  {
    type: 'Select',
    label: 'Study Data Repository',
    initialValue: '',
    placeholder: 'Select a data repository',
    dropdownData: [
      {
        value: 'BioSystics-AP',
        label: 'BioSystics-AP',
      },
      {
        value: 'Database of Genotypes and Phenotypes (dbGaP)',
        label: 'Database of Genotypes and Phenotypes (dbGaP)',
      },
      {
        value: 'Dryad',
        label: 'Dryad',
      },
      {
        value: 'FaceBase',
        label: 'FaceBase',
      },
      {
        value: 'Figshare',
        label: 'Figshare',
      },
      {
        value: 'Gene Expression Omnibus (GEO)',
        label: 'Gene Expression Omnibus (GEO)',
      },
      {
        value: 'GitHub',
        label: 'GitHub',
      },
      {
        value: 'Harvard Dataverse',
        label: 'Harvard Dataverse',
      },
      {
        value: 'ICPSR',
        label: 'ICPSR',
      },
      {
        value: 'openICPSR',
        label: 'openICPSR',
      },
      {
        value: 'JCOIN',
        label: 'JCOIN',
      },
      {
        value: 'MassIVE',
        label: 'MassIVE',
      },
      {
        value: 'Mendeley Data',
        label: 'Mendeley Data',
      },
      {
        value: 'Mouse Genome Informatics (MGI)',
        label: 'Mouse Genome Informatics (MGI)',
      },
      {
        value: 'Mouse Phenome Database (MPD)',
        label: 'Mouse Phenome Database (MPD)',
      },
      {
        value: 'NAHDAP',
        label: 'NAHDAP',
      },
      {
        value: 'National Sleep Research Resource (NSRR)',
        label: 'National Sleep Research Resource (NSRR)',
      },
      {
        value: 'NICHD DASH',
        label: 'NICHD DASH',
      },
      {
        value: 'NIDA Data Share',
        label: 'NIDA Data Share',
      },
      {
        value: 'NIDDK Central Repository',
        label: 'NIDDK Central Repository',
      },
      {
        value: 'NIMH Data Archive',
        label: 'NIMH Data Archive',
      },
      {
        value: 'OpenNEURO',
        label: 'OpenNEURO',
      },
      {
        value: 'Open Science Framework',
        label: 'Open Science Framework',
      },
      {
        value: 'Pennsieve',
        label: 'Pennsieve',
      },
      {
        value: 'Protocols.io',
        label: 'Protocols.io',
      },
      {
        value: 'Qualitative Data Repository at Syracuse University',
        label: 'Qualitative Data Repository at Syracuse University',
      },
      {
        value: 'Rat Genome Database (RGD)',
        label: 'Rat Genome Database (RGD)',
      },
      {
        value: 'Sequence Read Archive (SRA)',
        label: 'Sequence Read Archive (SRA)',
      },
      {
        value: 'SPARC',
        label: 'SPARC',
      },
      {
        value: 'Vivli',
        label: 'Vivli',
      },
      {
        value: 'The Zebrafish Model Organism Database (ZFIN)',
        label: 'The Zebrafish Model Organism Database (ZFIN)',
      },
      {
        value: 'Zenodo',
        label: 'Zenodo',
      },
    ],
    variable: 'repository',
  },
  {
    type: 'markdown',
    className: 'text-sm mt-0 mb-10',
    text: 'If you have already selected a data repository, indicate it here; otherwise, leave empty. If you have deposited your data and you have a unique Study ID for the data at the repository, enter it below; otherwise, leave blank.',
  },
  {
    type: 'Tags',
    label:
      'Study Data ID from Repository: \nPress Enter to add a unique ID for a study within the repository',
    placeholder: 'Enter the unique ID for the study within the repository',
    variable: 'repository_study_ids',
  },
];
const mockConfig = {
  mdsURL: 'https://qa-heal.planx-pla.net/mds',
  cedarWrapperURL: 'https://qa-heal.planx-pla.net/cedar',
  clinicalTrialFields: [
    'NCTId',
    'OfficialTitle',
    'BriefTitle',
    'Acronym',
    'StudyType',
    'OverallStatus',
    'StartDate',
  ],
  form: [
    {
      type: 'markdown',
      text: '## Registration Information',
    },
    {
      type: 'Select',
      label: 'Study',
      initialValue: '',
      required: true,
      data: [],
      variable: 'study_id',
    },
    {
      type: 'CedarUserUUID',
      label: 'CEDAR User UUID',
      required: true,
      variable: 'cedar_uuid',
    },
    {
      type: 'markdown',
      className: 'text-sm mb-10 !mt-0',
      text: [
        '[Get CEDAR User UUID](https://cedar.metadatacenter.org/)',
        'A CEDAR user UUID is required in this process so the created CEDAR instances can be shared with you. We do not save this ID on the platform',
      ],
    },
    {
      type: 'ClinicalTrialID',
      label: 'ClinicalTrials.gov ID',
      variable: 'clinical_trials_id',
    },
    {
      type: 'markdown',
      text: '## Repository Information',
    },
    {
      type: 'Select',
      label: 'Study Data Repository',
      initialValue: '',
      placeholder: 'Select a data repository',
      data: [
        {
          value: 'BioSystics-AP',
          label: 'BioSystics-AP',
        },
        {
          value: 'Database of Genotypes and Phenotypes (dbGaP)',
          label: 'Database of Genotypes and Phenotypes (dbGaP)',
        },
        {
          value: 'Dryad',
          label: 'Dryad',
        },
      ],
      variable: 'repository',
    },
    {
      type: 'markdown',
      className: 'text-sm mt-0 mb-10',
      text: 'If you have already selected a data repository, indicate it here; otherwise, leave empty. If you have deposited your data and you have a unique Study ID for the data at the repository, enter it below; otherwise, leave blank.',
    },
    {
      type: 'Tags',
      label:
        'Study Data ID from Repository: \nPress Enter to add a unique ID for a study within the repository',
      placeholder: 'Enter the unique ID for the study within the repository',
      variable: 'repository_study_ids',
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
  error: {
    content: [
      {
        type: 'markdown',
        text: [
          '# A problem has occurred during registration',
          'If the issue continues please contact your adminsitrator.',
        ],
        className: 'text-center',
      },
    ],
  },
};

const meta: unknown = {
  title: 'DiscoveryForms/StudyRegistration',
  component: FormContentViews,
  args: {
    studyUID: 'STUDY-123',
    formBody: mockFormBody as FormPropsBody[],
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
export const ErrorState = {
  args: {
    formOutcome: FormOutcome.error,
    formError:
      '{error: true,code: 400,message: "Example Form Error Message.", details:"Example Form Error Details"}',
  },
};
export const ErrorStateNoErrorInfo = {
  args: {
    formOutcome: FormOutcome.error,
  },
};
