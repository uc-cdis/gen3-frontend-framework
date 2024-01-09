import React, { ReactElement } from 'react';
import { JSONObject } from '@gen3/core';
import { StudyPageConfig } from '../types';
import StudyGroupPanel from '../StudyDetails/StudyGroupPanel';
import { CopyButton, Stack } from '@mantine/core';
import { getStringValueFromJSONObject } from "../utils";

interface StudyPagePanelProps {
  readonly data: JSONObject;
  readonly studyPageConfig: StudyPageConfig;
}

const StudyPagePanel = ({
  data,
                     studyPageConfig,
}: StudyPagePanelProps): ReactElement => {

  const headerText = getStringValueFromJSONObject(data, studyPageConfig.header?.field);
  return (
    <Stack>

    </Stack>
  );
};

export default StudyPagePanel;
