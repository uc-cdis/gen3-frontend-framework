import React, { ReactElement } from 'react';
import { JSONObject } from '@gen3/core';
import { StudyPageConfig } from '../types';
import StudyGroupPanel from '../StudyDetails/StudyGroupPanel';
import { Stack } from '@mantine/core';
import { getStringValueFromJSONObject } from "../utils";

interface StudyPagePanelProps {
  readonly data: JSONObject;
  readonly stupyPageConfig: StudyPageConfig;
}

const StudyPagePanel = ({
  data,
                     stupyPageConfig,
}: StudyPagePanelProps): ReactElement => {

  const headerText = getStringValueFromJSONObject(data, stupyPageConfig.header?.field);
  return (
    <Stack>
      <div className="flex flex-col my-2 w-full">
        { headerText &&
          <div className="bg-accent-lightest w-full p-1 mb-4">
            {headerText}
          </div>
        }
      <StudyGroupPanel data={data}  />
    </Stack>
  );
};

export default StudyPagePanel;
