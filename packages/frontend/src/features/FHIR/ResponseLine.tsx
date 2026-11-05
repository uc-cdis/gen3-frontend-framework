import React, { type ReactElement } from 'react';
import { Badge, Button, Text } from '@mantine/core';
import { FiCode } from 'react-icons/fi';
import type { TabResult } from './search';
import { countLabel, statusLabel } from './utils';

interface ResponseLineProps {
  result?: TabResult;
  // The params changed since the last Send
  stale: boolean;
  // Undefined while loading, so the button is disabled
  onViewJson?: () => void;
}

// While a re-Send loads, this still shows the last reply's status and time
const ResponseLine = ({
  result,
  stale,
  onViewJson,
}: ResponseLineProps): ReactElement => {
  const failed = !!result?.error;
  const label =
    result?.status !== undefined
      ? statusLabel(result.status)
      : failed
        ? 'Error'
        : 'OK';

  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Text fw={600}>Results</Text>
        {result?.bundle && (
          <Badge
            size="lg"
            radius="xl"
            tt="none"
            fw={600}
            className="border border-emerald-200 bg-emerald-50 text-emerald-700"
          >
            {countLabel(result.bundle)}
          </Badge>
        )}
        {stale && (
          <Text size="sm" c="orange">
            Params changed. Press Send to update.
          </Text>
        )}
      </div>
      {result?.ms !== undefined && (
        <div
          className={`flex items-center gap-2 text-sm ${result.loading ? 'opacity-50' : ''}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${failed ? 'bg-red-500' : 'bg-emerald-500'}`}
          />
          <span
            className={`font-semibold ${failed ? 'text-red-600' : 'text-emerald-700'}`}
          >
            {label}
          </span>
          <span className="text-gray-500">{result.ms} ms</span>
          <Button
            size="xs"
            radius="xl"
            variant="default"
            leftSection={<FiCode />}
            className="ml-2 enabled:text-blue-700"
            onClick={onViewJson}
            disabled={!onViewJson}
          >
            Response JSON
          </Button>
        </div>
      )}
    </div>
  );
};

export default ResponseLine;
