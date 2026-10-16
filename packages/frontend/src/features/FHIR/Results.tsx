import React, { type ReactElement, useCallback, useState } from 'react';
import { Loader, LoadingOverlay, Paper, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { fhirSearchUrl } from '@gen3/core';
import { EmptyTableMessage } from '../../components/MessageCards';
import JsonModal, { type JsonView } from './JsonModal';
import Pager from './Pager';
import ResponseLine from './ResponseLine';
import EntryList from './EntryList';
import SearchError from './SearchError';
import { useOrigin } from './hooks';
import type { TabResult } from './search';
import { toAbsoluteUrl } from './utils';

interface ResultsProps {
  resource: string;
  // Undefined until this tab's first Send
  result?: TabResult;
  // The params changed since the last Send
  stale: boolean;
  onBack?: () => void;
  onNext?: () => void;
  onRetry?: () => void;
}

const Results = ({
  resource,
  result,
  stale,
  onBack,
  onNext,
  onRetry,
}: ResultsProps): ReactElement => {
  const origin = useOrigin();
  // `view` outlives `opened`, so the modal keeps its content while it fades out
  const [view, setView] = useState<JsonView>();
  const [opened, { open, close }] = useDisclosure(false);

  const show = useCallback(
    (title: string, value: unknown, url?: string) => {
      setView({ title, json: JSON.stringify(value, null, 2), url });
      open();
    },
    [open],
  );

  const entries = result?.bundle?.entry ?? [];

  // The whole reply, or the error body when it failed
  const viewResponse =
    result && !result.loading
      ? () =>
          show(
            `Response · ${resource} · page ${result.trail.length + 1}`,
            result.error ?? result.bundle,
            toAbsoluteUrl(
              fhirSearchUrl(
                result.sent.resource,
                result.sent.params,
                result.sent.page,
              ),
              origin,
            ),
          )
      : undefined;

  const body = () => {
    if (!result)
      return (
        <Text c="dimmed" ta="center" py="md">
          Press Send to search {resource}. With no params you get the first 100.
        </Text>
      );
    if (result.error && !result.loading)
      return <SearchError status={result.status} onRetry={onRetry} />;
    if (!result.bundle)
      return (
        <div className="flex items-center justify-center gap-2 py-6">
          <Loader size="sm" />
          <Text c="dimmed">Searching {resource}…</Text>
        </div>
      );
    const content =
      entries.length === 0 ? (
        <EmptyTableMessage message={`No ${resource} matches these params.`} />
      ) : (
        <EntryList entries={entries} onView={show} />
      );
    return (
      // Old results stay under an overlay while a new request loads
      <div className="relative">
        <LoadingOverlay visible={result.loading} />
        {content}
      </div>
    );
  };

  return (
    <Paper withBorder radius="md" shadow="xs" p="md">
      <ResponseLine result={result} stale={stale} onViewJson={viewResponse} />
      {result && (
        <Pager
          className="mb-3"
          result={result}
          stale={stale}
          onBack={onBack}
          onNext={onNext}
        />
      )}
      {body()}
      <JsonModal view={view} opened={opened} onClose={close} />
    </Paper>
  );
};

export default Results;
