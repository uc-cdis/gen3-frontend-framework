import React, { ReactElement } from 'react';
import { Text } from '@mantine/core';

/**
 * Renders a label for a field. If the label text is undefined, returns an empty fragment.
 * @param labelText - the label text to render.
 */
const Label = (labelText?: string): ReactElement =>
  labelText ? (
    <Text
      tt="uppercase"
      fw="700"
      size="sm"
      className="p-0.75 whitespace-pre-wrap break-words"
    >
      {labelText}
    </Text>
  ) : (
    <React.Fragment />
  );

export default Label;
