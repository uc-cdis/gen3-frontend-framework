import React, { type ReactElement, useState } from 'react';
import { Title } from '@mantine/core';
import { fhirSearchUrl, useGetFhirCapabilityQuery } from '@gen3/core';
import QueryParams from './QueryParams';
import RequestBar from './RequestBar';
import ResourceTabs from './ResourceTabs';
import Results from './Results';
import ServerStatus from './ServerStatus';
import { RESOURCE_TABS } from './constants';
import { useFhirSearch, useOrigin } from './hooks';
import { paramsFor, rowError, rowsToParams, type ParamRow } from './params';
import { readableUrl, toAbsoluteUrl } from './utils';

const whyNoParams = (isError: boolean, loaded: boolean, resource: string) => {
  if (isError) return "Couldn't load params from the server";
  if (!loaded) return 'Loading params…';
  return `This server doesn't support ${resource}`;
};

const FhirQuery = (): ReactElement => {
  const origin = useOrigin();
  const { data: capability, isError } = useGetFhirCapabilityQuery();
  const [resource, setResource] = useState(RESOURCE_TABS[0]);
  // Each tab keeps its own rows, so switching back doesn't lose them
  const [rowsByTab, setRowsByTab] = useState<Record<string, ParamRow[]>>({});

  const rows = rowsByTab[resource] ?? [];
  const params = paramsFor(capability, resource);
  const { result, send, next, back, retry } = useFhirSearch(resource);

  // Tabs the server doesn't list. None today; this is a safeguard.
  const unsupported = capability
    ? RESOURCE_TABS.filter((type) => !capability.some((r) => r.type === type))
    : [];

  // What Send would send right now
  const draft = rowsToParams(rows);
  const draftUrl = fhirSearchUrl(resource, draft);
  // The server's error can't say which value was bad, so we stop it here.
  // Unchecked rows aren't sent, so they don't count.
  const invalid = rows.some((row) => row.enabled && rowError(row));

  // Readable in the UI. The real request is still fully encoded.
  const url = readableUrl(toAbsoluteUrl(draftUrl, origin));

  const stale =
    !!result &&
    fhirSearchUrl(result.sent.resource, result.sent.params) !== draftUrl;

  // Paging continues the sent search, so it waits for Send once params change
  const unlessStale = (go?: () => Promise<void>) =>
    go && !stale ? () => void go() : undefined;

  // Runs a row recipe on this tab's latest rows
  const updateRows = (update: (rows: ParamRow[]) => ParamRow[]) =>
    setRowsByTab((prev) => ({
      ...prev,
      [resource]: update(prev[resource] ?? []),
    }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Title order={2}>FHIR Query</Title>
        <ServerStatus />
      </div>
      <RequestBar
        url={url}
        onSend={invalid ? undefined : () => void send(draft)}
        loading={result?.loading}
      />
      <ResourceTabs
        value={resource}
        onChange={setResource}
        unsupported={unsupported}
      />
      <QueryParams
        resource={resource}
        params={params}
        unavailable={
          params ? undefined : whyNoParams(isError, !!capability, resource)
        }
        rows={rows}
        onRowsChange={updateRows}
      />
      <Results
        resource={resource}
        result={result}
        stale={stale}
        onBack={unlessStale(back)}
        onNext={unlessStale(next)}
        onRetry={retry && (() => void retry())}
      />
    </div>
  );
};

export default FhirQuery;
