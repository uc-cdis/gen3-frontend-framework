import React, { useMemo } from 'react';
import { StudyTabGroup } from '../types';
import { Text } from '@mantine/core';
import { JSONObject } from '@gen3/core';
import { createFieldRendererElement }  from './StudyItems';
import { JSONPath } from 'jsonpath-plus';

interface StudyTabGroupProps extends StudyTabGroup {
  readonly data: JSONObject;
}

const StudyGroup = ({ data, header, fields }: StudyTabGroupProps) => {

  const groupHasContent = useMemo(() => fields.some(
    (field) => {
      if (!field.sourceField) {
        return false;
      }
      const resourceFieldValue = JSONPath({ json: data, path: field.sourceField });
      return (resourceFieldValue
        && resourceFieldValue.length > 0
        && resourceFieldValue[0].length !== 0);
    },
  ), [fields, data]);

  if (!groupHasContent) {
    return null;
  }

  return (
    <div className=" flex flex-col">
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
