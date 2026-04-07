import React from 'react';
import { JSONValue } from '@gen3/core';
import { discoveryFieldStyle } from './utils';
import Label from './Label';

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
