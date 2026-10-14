import React, { type ReactElement, useState } from 'react';
import { Title } from '@mantine/core';
import { fhirSearchUrl, useGetFhirCapabilityQuery } from '@gen3/core';
import QueryParams from './QueryParams';
import RequestBar from './RequestBar';
import ResourceTabs from './ResourceTabs';
import ServerStatus from './ServerStatus';
import { RESOURCE_TABS } from './constants';
import { useOrigin } from './hooks';
import { paramsFor, rowsToParams, type ParamRow } from './params';
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

  // Manually defined resources not supported, if any. This is just for protection.
  const unsupported = capability
    ? RESOURCE_TABS.filter((type) => !capability.some((r) => r.type === type))
    : [];
  // Readable in the UI. The real request is still fully encoded.
  const url = readableUrl(
    toAbsoluteUrl(fhirSearchUrl(resource, rowsToParams(rows)), origin),
  );

  // Update the resource's rows based on the update function
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
      <RequestBar url={url} />
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
    </div>
  );
};

export default FhirQuery;
