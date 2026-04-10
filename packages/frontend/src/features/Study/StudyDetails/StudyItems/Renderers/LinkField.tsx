import Link from 'next/link';
import { Text } from '@mantine/core';

/**
 * Renders a single formatted link
 *
 * @param {string} linkValue - A string of a URL
 * @returns {ReactElement | null} Returns a formatted link
 */
const LinkField = (linkValue: string) => (
  <Link
    href={linkValue}
    className="text-right"
    target="_blank"
    rel="noreferrer"
  >
    <Text c="utility.0" className="underline">
      {linkValue}
    </Text>
  </Link>
);

export default LinkField;
