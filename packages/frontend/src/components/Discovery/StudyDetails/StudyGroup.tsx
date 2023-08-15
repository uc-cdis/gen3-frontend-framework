import { StudyTabGroup } from '../types';
import { Text } from '@mantine/core';
import { JSONPath } from 'jsonpath-plus';
import { JSONObject } from '@gen3/core';

interface StudyTabGroupProps extends StudyTabGroup {
  readonly data: JSONObject;
}

const StudyGroup = ({ data, header, fields }: StudyTabGroupProps) => {
  return (
    <div className="flex flex-col">
      <div className="bg-secondary w-full p-4">
        <Text>{header}</Text>
        {fields.map((field) => {
          console.log('StudyGroup', field);
          return (
            <div key={field.sourceField} className="flex">
              <Text>{field.label}</Text>
              <Text>{JSONPath({ json: data, path: field.sourceField }) ?? field.default ?? '...'}</Text>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudyGroup;
