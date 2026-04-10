import React, { useId } from 'react';
import { JSONValue } from '@gen3/core';
import { FieldRendererFunction } from '../RendererFactory';
import { discoveryFieldStyle } from './utils';
import Label from './Label';
import TextField from './TextField';

/**
 * Renders a labeled text field
 * @param {JSONValue} fieldValue - JSON object containing the data from which the field's value is extracted
 * @param {string} fieldLabel - Label for the text field
 * @returns {ReactElement | null} Returns a label followed a text field
 */
const LabeledSingleTextField: FieldRendererFunction = (
  fieldValue: JSONValue,
  fieldLabel?: string,
  params?: Record<string, any>,
) => {
  let stringFieldValue = '';
  if (typeof fieldValue === 'number') {
    stringFieldValue = fieldValue.toLocaleString();
  } else if (typeof fieldValue !== 'string') return <React.Fragment />;

  stringFieldValue = fieldValue as string;
  const id = useId();
  return (
    <div
      className={discoveryFieldStyle}
      key={`study-details-${fieldLabel}-${stringFieldValue}-${id}`}
    >
      {Label(fieldLabel)} {TextField(stringFieldValue, params?.style ?? '')}
    </div>
  );
};

export default LabeledSingleTextField;
