import { StudyTabGroup } from '../types';
import { Text } from '@mantine/core';
import { JSONObject } from '@gen3/core';
import { createFieldRendererElement }  from './StudyItems';

interface StudyTabGroupProps extends StudyTabGroup {
  readonly data: JSONObject;
}

const StudyGroup = ({ data, header, fields }: StudyTabGroupProps) => {
  return (
    <div className=" flexflex-col">
      <div className="bg-accent-lightest w-full p-1 mb-4">
        <Text color="primary">{header}</Text>
      </div>
      <div className="
      +0p-4">
        {fields.map((field) => {
          return (
            createFieldRendererElement(field, data as any)
          );
        })}
      </div>
    </div>
  );
};

export default StudyGroup;
