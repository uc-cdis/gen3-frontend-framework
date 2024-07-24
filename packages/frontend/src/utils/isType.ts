import React, { CSSProperties } from 'react';

export const isArrayOfString = (value: any): value is Array<string> => {
  return (
    Array.isArray(value) &&
    value.every((element) => typeof element === 'string')
  );
};

// Define the valid textTransform values
const validTextTransforms: Array<CSSProperties['textTransform']> = [
  'none',
  'capitalize',
  'uppercase',
  'lowercase',
  'full-width',
  'full-size-kana',
  'inherit',
  'initial',
  'revert',
  'unset',
];

// Type guard function
export const isTextTransform = (
  value: any,
): value is CSSProperties['textTransform'] => {
  return validTextTransforms.includes(value);
};
