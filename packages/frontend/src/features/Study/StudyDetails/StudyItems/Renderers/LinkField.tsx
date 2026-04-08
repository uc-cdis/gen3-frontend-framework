import Link from 'next/link';
import { Text } from '@mantine/core';

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
