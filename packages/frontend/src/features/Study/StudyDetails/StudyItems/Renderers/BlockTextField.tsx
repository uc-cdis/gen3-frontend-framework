import React, { ReactElement } from 'react';
import { discoveryFieldStyle, jsonValueToElement } from './utils';
import { JSONValue } from '@gen3/core';

/**
 * Renders a block of text.
 *
 * @param {JSONValue} fieldValue - The value to render.
 * @returns {ReactElement} The rendered block of text.
 */
const BlockTextField = (fieldValue: JSONValue): ReactElement => (
  <div className={discoveryFieldStyle}>{jsonValueToElement(fieldValue)}</div>
);

export default BlockTextField;
