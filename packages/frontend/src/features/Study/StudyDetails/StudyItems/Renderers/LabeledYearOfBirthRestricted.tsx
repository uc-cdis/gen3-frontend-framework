import { JSONValue } from '@gen3/core';
import { FieldRendererFunction } from '../RendererFactory';
import { isArray } from 'lodash';
import React from 'react';
import { discoveryFieldStyle } from './utils';
import TextField from './TextField';
import Label from './Label';

const LabeledYearOfBirthRestricted: FieldRendererFunction = (
  fieldValue: JSONValue,
  fieldLabel?: string,
) => {
  let stringFieldValue = '';
  if (typeof fieldValue === 'number') {
    stringFieldValue = fieldValue.toLocaleString();
  } else if (typeof fieldValue !== 'string') return <React.Fragment />;

  stringFieldValue = fieldValue as string;

  let displayContent;
  if (
    typeof stringFieldValue === 'string' &&
    !isNaN(Number(stringFieldValue)) &&
    Number(stringFieldValue) < 1935
  ) {
    displayContent = '1935';
  } else if (isArray(stringFieldValue)) {
    displayContent = stringFieldValue
      .map((item) => {
        if (
          typeof item === 'string' &&
          !isNaN(Number(item)) &&
          Number(item) < 1935
        ) {
          return '1935';
        }
        return item;
      })
      .join(', ');
  } else {
    displayContent = stringFieldValue;
  }

  return (
    <div
      className={discoveryFieldStyle}
      key={`study-details-${fieldLabel}-${displayContent}`}
    >
      {Label(fieldLabel)} {TextField(displayContent)}
    </div>
  );
};

export default LabeledYearOfBirthRestricted;
