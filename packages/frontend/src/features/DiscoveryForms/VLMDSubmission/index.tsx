import React from 'react';
import type { ReactElement } from 'react';
import { Tabs } from '@mantine/core';
import DataDictionarySubmission from './DataDictionarySubmission';
import CDESubmission from './CDESubmission';
import type { VLMDSubmissionProps } from './types';

const VLMDSubmissionTabbedPanel = (props: VLMDSubmissionProps): ReactElement => (
  <Tabs defaultValue="dd-sub">
    <Tabs.List>
      <Tabs.Tab value="dd-sub">Submit DD</Tabs.Tab>
      <Tabs.Tab value="cde-sub">Submit CDE</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="dd-sub" pt="md">
      <DataDictionarySubmission {...props} />
    </Tabs.Panel>
    <Tabs.Panel value="cde-sub" pt="md">
      <CDESubmission {...props} />
    </Tabs.Panel>
  </Tabs>
);

export default VLMDSubmissionTabbedPanel;
