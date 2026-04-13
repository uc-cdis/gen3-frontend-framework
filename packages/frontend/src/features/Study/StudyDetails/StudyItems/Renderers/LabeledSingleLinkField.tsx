import { JSONValue } from '@gen3/core';
import React, { ReactElement, useId } from 'react';
import { discoveryFieldStyle } from './utils';
import Label from './Label';
import LinkField from './LinkField';

/**
 * Renders a labeled link
 * @param {JSONValue} linkValue - JSON object containing the data from which the field's value is extracted
 * @param {string} labelText - Label for the link
 * @returns {ReactElement | null} Returns a label followed a paragraph
 */
const LabeledSingleLinkField = (
  linkValue: JSONValue,
  labelText?: string,
  parans?: Record<string, any>,
) => {
  const id = useId();
  if (typeof linkValue !== 'string' || linkValue === '')
    return <React.Fragment />;
  return (
    <div className={discoveryFieldStyle} key={labelText + id}>
      {Label(labelText)} {LinkField(linkValue)}
    </div>
  );
};

export default LabeledSingleLinkField;
