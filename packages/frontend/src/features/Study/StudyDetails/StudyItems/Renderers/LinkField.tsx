import Link from 'next/link';
import { Text } from '@mantine/core';

<<<<<<< HEAD
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
=======
const LinkField = (linkValue: string) => (
  <Link href={linkValue} target="_blank" rel="noreferrer">
>>>>>>> 49ef6982 (feat(discoveryDetailsPlaceholders): Began refactoring renderers into separate files)
    <Text c="utility.0" className="underline">
      {linkValue}
    </Text>
  </Link>
);

export default LinkField;
