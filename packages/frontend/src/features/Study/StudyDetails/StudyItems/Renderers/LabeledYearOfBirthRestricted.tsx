import { JSONValue } from '@gen3/core';
import { FieldRendererFunction } from '../RendererFactory';
import { isArray } from 'lodash';
import React from 'react';
import { discoveryFieldStyle } from './utils';
import TextField from './TextField';
import Label from './Label';

/**
 * Renders a labeled year of birth, that renders 1935 as the oldest allowable year or nothing if missing fieldValue
 *
 * @param {JSONValue} fieldValue - JSON object containing the data from which the field's value is extracted
 * @param {string} fieldLabel - Label for the year of birth
 * @returns {ReactElement | null} Returns a label followed a year of birth
 */
const LabeledYearOfBirthRestricted: FieldRendererFunction = (
  fieldValue: JSONValue,
  fieldLabel?: string,
) => {
  let stringFieldValue = '';
  const oldestAllowableYear = 1935;
  if (typeof fieldValue === 'number') {
    stringFieldValue = fieldValue.toLocaleString();
  } else if (typeof fieldValue !== 'string') return <React.Fragment />;

  stringFieldValue = fieldValue as string;

  let displayContent;
  if (
    typeof stringFieldValue === 'string' &&
    !isNaN(Number(stringFieldValue)) &&
    Number(stringFieldValue) < oldestAllowableYear
  ) {
    displayContent = oldestAllowableYear;
  } else if (isArray(stringFieldValue)) {
    displayContent = stringFieldValue
      .map((item) => {
        if (
          typeof item === 'string' &&
          !isNaN(Number(item)) &&
          Number(item) < oldestAllowableYear
        ) {
          return oldestAllowableYear.toString;
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
