import React, { useMemo } from 'react';
import { StudyTabGroup } from '../types';
import { Text } from '@mantine/core';
import { JSONObject } from '@gen3/core';
import { createFieldRendererElement } from './StudyItems/StudyItems';
import { JSONPath } from 'jsonpath-plus';

interface StudyTabGroupProps extends StudyTabGroup {
  readonly data: JSONObject;
}

const StudyGroup = ({ data, header, fields }: StudyTabGroupProps) => {
  const groupHasContent = useMemo(
    () =>
      fields.some((field) => {
        // TDDO: handle ifFieldIsNotAvailable
        if (!field.field) {
          return false;
        }
        const resourceFieldValue = JSONPath({
          json: data,
          path: field.field,
        });
        return (
          resourceFieldValue &&
          resourceFieldValue.length > 0 &&
          resourceFieldValue[0].length !== 0
        );
      }),
    [fields, data],
  );

  if (!groupHasContent) {
    return null;
  }

  return (
    <div className=" flex flex-col">
<<<<<<< HEAD
      <div className="bg-accent-lightest w-full p-1 mb-2 mt-1">
=======
      <div className="bg-accent-lightest w-full p-1 mb-2">
<<<<<<< HEAD
>>>>>>> 49ef6982 (feat(discoveryDetailsPlaceholders): Began refactoring renderers into separate files)
=======
>>>>>>> d6ad4328 (feat(discoveryDetailsPlaceholders): Began refactoring renderers into separate files)
        <Text c="primary" fw={700}>
          {header}
        </Text>
      </div>
      <>
        {fields.map((field) => {
          return createFieldRendererElement(field, data as any);
        })}
      </>
    </div>
  );
};

export default StudyGroup;
