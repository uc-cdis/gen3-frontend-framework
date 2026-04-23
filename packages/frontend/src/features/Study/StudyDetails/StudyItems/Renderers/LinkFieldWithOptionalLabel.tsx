import React, { ReactElement } from 'react';
import Link from 'next/link';
import { Text } from '@mantine/core';

/**
 * Represents a link field component that generates a hyperlink with an optional text label.
 *
 * @param linkValue - The target URL for the hyperlink.
 * @param linkText - The optional text label for the hyperlink. If not provided, the linkValue will be used as the label.
 * @returns A JSX element containing the generated hyperlink.
 */
const LinkFieldWithOptionalLabel = (
  linkValue: string,
  linkText?: string,
): ReactElement => (
  <Link href={linkValue} target="_blank" rel="noreferrer">
    <Text c="utility.0" className="underline">
      {linkText ?? linkValue}
    </Text>
  </Link>
);

export default LinkFieldWithOptionalLabel;
