import React from 'react';
import { JSONValue } from '@gen3/core';
import { discoveryFieldStyle } from './utils';
import Label from './Label';

<<<<<<< HEAD
<<<<<<< HEAD
/**
 * Renders a labeled number field
 *
 * @param {JSONValue} fieldValue - JSON object containing the data from which the field's value is extracted
 * @param {string} labelText - Label for the number
 * @returns {ReactElement | null} Returns a label followed a number
 */
=======
>>>>>>> 49ef6982 (feat(discoveryDetailsPlaceholders): Began refactoring renderers into separate files)
=======
>>>>>>> d6ad4328 (feat(discoveryDetailsPlaceholders): Began refactoring renderers into separate files)
const LabeledNumberField = (fieldValue: JSONValue, labelText?: string) => {
  if (typeof fieldValue !== 'number' && typeof fieldValue !== 'string')
    return <React.Fragment />;
  return (
    <div className={discoveryFieldStyle} key={labelText}>
      {Label(labelText)} {fieldValue?.toLocaleString()}
    </div>
  );
};

export default LabeledNumberField;
