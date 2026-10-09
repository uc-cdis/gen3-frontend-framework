import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import VLMDSubmissionTabbedPanel from './index';

const meta = {
  component: VLMDSubmissionTabbedPanel,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof VLMDSubmissionTabbedPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

const baseConfig = {
  dataDictionarySubmissionBucket: 'heal-vlmd-submission',
  variableMetadataField: 'variable_level_metadata',
  gen3DiscoveryField: 'gen3_discovery',
  tagsListFieldName: 'tags',
  remoteSupportService: {
    service: 'zendesk',
    configuration: {
      zendeskSubdomainName: 'example',
    },
  },
};

const baseArgs = {
  studyUID: 'HDP00210',
  studyProjectNumber: 'R01DA999999',
  studyName: 'Understanding Pain Mechanisms in Chronic Back Pain',
  studyRegistrationAuthZ: '/study/9613939',
  config: baseConfig,
  disableCDESubmissionForm: false,
  existingDataDictionaryNames: [],
  existingCDENames: [],
};

export const WithAccess: Story = {
  name: 'With Submit Access',
  args: {
    ...baseArgs,
    userHasAccessToSubmit: true,
  },
};

export const WithoutAccess: Story = {
  name: 'Without Submit Access',
  args: {
    ...baseArgs,
    userHasAccessToSubmit: false,
  },
};

export const WithExistingSubmissions: Story = {
  name: 'Existing DD and CDE Submissions',
  args: {
    ...baseArgs,
    userHasAccessToSubmit: true,
    existingDataDictionaryNames: ['pain_survey_v1', 'clinical_outcomes_v2'],
    existingCDENames: [],
  },
};

export const CDEFromREDCap: Story = {
  name: 'CDE Locked (from REDCap)',
  args: {
    ...baseArgs,
    userHasAccessToSubmit: true,
    disableCDESubmissionForm: true,
  },
};
