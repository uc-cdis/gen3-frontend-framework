import React, { ReactElement } from 'react';
import { JSONValue } from '@gen3/core';
import { Text } from '@mantine/core';
import { toString } from 'lodash';

/**
 * Renders a text field component.
 *
 * @param {string} fieldValue - The value to be displayed in the text field.
 * @returns {React.Element} - The rendered text field component.
 */
const TextField = (fieldValue: JSONValue, style = ''): ReactElement => (
  <span
    className={`text-left overflow-hidden p-0.75 whitespace-pre-wrap break-words ${style}`}
  >
    <Text size="sm">{toString(fieldValue)}</Text>
  </span>
);

export default TextField;
