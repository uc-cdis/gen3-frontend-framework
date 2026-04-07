import { JSONValue } from '@gen3/core';
import { FieldRendererFunction } from '../RendererFactory';
import { Text } from '@mantine/core';
import { discoveryFieldStyle } from './utils';
import { toString } from 'lodash';
import React from 'react';

<<<<<<< HEAD
/**
 * Renders a labeled paragraph
 * @param {JSONValue} fieldValue - JSON object containing the data from which the field's value is extracted
 * @param {string} fieldLabel - Label for the paragraph
 * @returns {ReactElement | null} Returns a label followed a paragraph
 */
=======
>>>>>>> 49ef6982 (feat(discoveryDetailsPlaceholders): Began refactoring renderers into separate files)
const LabeledParagraph: FieldRendererFunction = (
  fieldValue: JSONValue,
  fieldLabel?: string,
) => {
  if (typeof fieldValue !== 'string') return <React.Fragment />;

  const stringFieldValue = fieldValue as string;
  return (
    <div
      className={`${discoveryFieldStyle}`}
      key={`study-details-${fieldLabel}-${stringFieldValue}`}
    >
      {fieldLabel ? (
        <Text
          tt="uppercase"
          fw="500"
          className="p-0.75 mr-4 whitespace-pre-wrap break-words"
        >
          {fieldLabel}
        </Text>
      ) : (
        <React.Fragment />
      )}
<<<<<<< HEAD
=======

>>>>>>> 49ef6982 (feat(discoveryDetailsPlaceholders): Began refactoring renderers into separate files)
      <div>
        <Text className="pl-4 text-left p-0.75 whitespace-pre-wrap break-words">
          {toString(fieldValue)}
        </Text>
      </div>
    </div>
  );
};

export default LabeledParagraph;
