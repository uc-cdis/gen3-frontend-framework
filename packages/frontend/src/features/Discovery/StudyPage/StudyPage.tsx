import React, { ReactElement } from 'react';
import { JSONObject } from '@gen3/core';
import { StudyPageConfig } from '../types';
import { Stack, Text } from '@mantine/core';
import { getStringValueFromJSONObject } from '../utils';

interface StudyPagePanelProps {
  readonly studyDetails: JSONObject;
  readonly studyPageConfig: StudyPageConfig;
}

const StudyPagePanel = ({
                          studyDetails,
                     studyPageConfig,
}: StudyPagePanelProps): ReactElement => {

  const headerText = getStringValueFromJSONObject(studyDetails, studyPageConfig.header?.field);
  return (
    <Stack>
        <Text size="lg" weight={700} className="mb-4">
          {headerText}
        </Text>
    </Stack>
);
};

export default StudyPagePanel;
