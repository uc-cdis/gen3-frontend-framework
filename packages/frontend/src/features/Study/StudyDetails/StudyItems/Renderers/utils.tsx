import { JSONValue } from '@gen3/core';
import React, { ReactElement } from 'react';

/**
 * Default style for discovery field.
 */
export const discoveryFieldStyle =
  'flex w-full justify-between px-1 no-wrap gap-x-2';

/**
 * Converts a JSON value into a React element.
 *
 * @param {JSONValue} value - The JSON value to convert.
 * @returns {ReactElement} The React element representing the JSON value.
 */
export const jsonValueToElement = (value: JSONValue): ReactElement => {
  if (typeof value === 'string') {
    // if JSONValue is a string, display it inside a span
    return <span>{value}</span>;
  } else if (typeof value === 'boolean') {
    // if JSONValue is a boolean, display it inside a span
    return <span>{value.toString()}</span>;
  } else if (typeof value === 'number') {
    // if JSONValue is a number, display it inside a span
    return <span>{value}</span>;
  } else if (Array.isArray(value)) {
    // if JSONValue is an array, map each item into a list element and wrap them in a ul
    return (
      <ul>
        {value.map((v, i) => (
          <li key={i}>{jsonValueToElement(v)}</li>
        ))}
      </ul>
    );
  } else if (typeof value === 'object' && value !== null) {
    // if JSONValue is an object (excluding null), display each property in its own line,
    // using a recursive call to display the value of each property
    return (
      <ul>
        {Object.entries(value).map(([k, v], i) => (
          <li key={i}>
            <strong>{k}:</strong> {jsonValueToElement(v)}
          </li>
        ))}
      </ul>
    );
  } else {
    // if JSONValue is null, or otherwise unhandled, return an empty fragment
    return <React.Fragment />;
  }
};
