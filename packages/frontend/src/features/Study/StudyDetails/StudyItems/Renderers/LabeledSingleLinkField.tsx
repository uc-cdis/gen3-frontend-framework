import { JSONValue } from '@gen3/core';
import React, { ReactElement, useId } from 'react';
import { discoveryFieldStyle } from './utils';
import Label from './Label';
import LinkField from './LinkField';

<<<<<<< HEAD
/**
 * Renders a labeled link
 * @param {JSONValue} linkValue - JSON object containing the data from which the field's value is extracted
 * @param {string} labelText - Label for the link
 * @returns {ReactElement | null} Returns a label followed a paragraph
 */
=======
>>>>>>> 49ef6982 (feat(discoveryDetailsPlaceholders): Began refactoring renderers into separate files)
const LabeledSingleLinkField = (
  linkValue: JSONValue,
  labelText?: string,
  parans?: Record<string, any>,
<<<<<<< HEAD
) => {
  const id = useId();
  return typeof linkValue !== 'string' ? (
    <React.Fragment />
  ) : (
    <div className={discoveryFieldStyle} key={labelText + id}>
      {Label(labelText)} {LinkField(linkValue)}
    </div>
  );
};
=======
) =>
  typeof linkValue !== 'string' ? (
    <React.Fragment />
  ) : (
    <div className={discoveryFieldStyle} key={labelText}>
      {Label(labelText)} {LinkField(linkValue)}
    </div>
  );

>>>>>>> 49ef6982 (feat(discoveryDetailsPlaceholders): Began refactoring renderers into separate files)
export default LabeledSingleLinkField;
