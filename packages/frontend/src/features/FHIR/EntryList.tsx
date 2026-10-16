import React, { memo, type ReactElement } from 'react';
import { Badge, Button } from '@mantine/core';
import { FiCode } from 'react-icons/fi';
import type { BundleEntry } from '@gen3/core';

interface EntryListProps {
  entries: BundleEntry[];
  // Must keep its identity between renders, or the memo never skips
  onView: (title: string, value: unknown) => void;
}

const EntryList = ({ entries, onView }: EntryListProps): ReactElement => (
  <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-gray-50">
    {entries.map((entry, i) => {
      const type = entry.resource?.resourceType;
      const id = entry.resource?.id;
      const name = `${type}/${id}`;
      return (
        <li key={id ?? i} className="flex items-center gap-3 px-4 py-2">
          <Badge
            radius="xl"
            tt="none"
            fw={600}
            className="border border-blue-200 bg-blue-50 text-blue-700"
          >
            {type}
          </Badge>
          <span className="font-mono text-sm">{id}</span>
          <Button
            size="xs"
            radius="xl"
            variant="default"
            leftSection={<FiCode />}
            className="ml-auto text-blue-700"
            aria-label={`View JSON for ${name}`}
            onClick={() => onView(name, entry.resource)}
          >
            View JSON
          </Button>
        </li>
      );
    })}
  </ul>
);

export default memo(EntryList);
