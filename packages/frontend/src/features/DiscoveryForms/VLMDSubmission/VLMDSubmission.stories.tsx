import React from 'react';
import { http, HttpResponse } from 'msw';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { GEN3_MDS_API } from '@gen3/core';
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
  advSearchFilterField: 'advSearchFilters',
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

const mockCDEMetadata = {
  HDPCDE4871: {
    drupal_id: '4871',
    file_name: 'NIDA-Modified ASSIST L2 (11-17)',
    is_core_cde: true,
  },
  HDPCDE5086: {
    drupal_id: '5086',
    file_name: 'Brief Pain Inventory (BPI)',
    is_core_cde: true,
  },
  HDPCDE5141: {
    drupal_id: '5141',
    file_name: 'Adult Demographics',
    is_core_cde: true,
  },
  HDPCDE5351: {
    drupal_id: '5351',
    file_name: 'Generalized Anxiety Disorder (GAD-7)',
    is_core_cde: true,
  },
  HDPCDE00001: {
    drupal_id: '00001',
    file_name: 'Demographics Adult',
    is_core_cde: false,
  },
  HDPCDE00002: {
    drupal_id: '00002',
    file_name: 'Demographics Pediatric',
    is_core_cde: false,
  },
  HDPCDE9861: {
    drupal_id: '9861',
    file_name: 'Health Literacy',
    is_core_cde: false,
  },
};

export const WithExistingCDEs: Story = {
  name: 'Existing CDE Selections (preloaded)',
  args: {
    ...baseArgs,
    userHasAccessToSubmit: true,
    existingCDENames: [
      '5086 Brief Pain Inventory (BPI)',
      '5141 Adult Demographics',
      '00001 Demographics Adult',
      '9861 Health Literacy',
    ],
  },
  parameters: {
    msw: {
      handlers: [
        http.get(`${GEN3_MDS_API}/metadata`, () =>
          HttpResponse.json(mockCDEMetadata),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Submit CDE' }));

    // Core CDEs from existingCDENames are ticked; other core CDEs are not.
    const bpi = await canvas.findByRole('checkbox', {
      name: '5086 Brief Pain Inventory (BPI)',
    });
    await waitFor(() => expect(bpi).toBeChecked());
    await expect(
      canvas.getByRole('checkbox', { name: '5141 Adult Demographics' }),
    ).toBeChecked();
    await expect(
      canvas.getByRole('checkbox', {
        name: '4871 NIDA-Modified ASSIST L2 (11-17)',
      }),
    ).not.toBeChecked();
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
