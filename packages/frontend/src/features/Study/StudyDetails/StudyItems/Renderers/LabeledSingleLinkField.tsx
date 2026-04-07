import { JSONValue } from '@gen3/core';
import React, { ReactElement, useId } from 'react';
import { discoveryFieldStyle } from './utils';
import Label from './Label';
import LinkField from './LinkField';

const LabeledSingleLinkField = (
  linkValue: JSONValue,
  labelText?: string,
  parans?: Record<string, any>,
) =>
  typeof linkValue !== 'string' ? (
    <React.Fragment />
  ) : (
    <div className={discoveryFieldStyle} key={labelText}>
      {Label(labelText)} {LinkField(linkValue)}
    </div>
  );

export default LabeledSingleLinkField;
