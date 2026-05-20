'use client';

'use client';

import React, { ReactElement, useState } from 'react';
import { useDeepCompareCallback, useDeepCompareMemo } from 'use-deep-compare';
import type { Fetcher } from '@graphiql/toolkit';
import { SegmentedControl, Text } from '@mantine/core';
import {
  GEN3_API,
  selectCSRFToken,
  selectHeadersWithCSRFToken,
  useCoreSelector,
} from '@gen3/core';
import { GqlQueryEditorProps } from './types';
import dynamic from 'next/dynamic';
import { getCookie } from 'cookies-next';

// Disable SSR for the GraphiQL component
const GraphiQL = dynamic(() => import('graphiql').then((mod) => mod.GraphiQL), {
  ssr: false,
});

/**
 * Fetches graphql data from a graphql endpoint if one is specified, or guppy by default.
 * @param graphQLEndpoint - The location of the graphql endpoint.
 * @returns a component containing a GraphiQl editor
 */
const GqlQueryEditor = ({
  graphQLEndpoints,
}: GqlQueryEditorProps): ReactElement => {
  const headers = useCoreSelector(selectHeadersWithCSRFToken);
  const csrfToken = useCoreSelector(selectCSRFToken);

  const selections = useDeepCompareMemo(
    () =>
      graphQLEndpoints?.map((endpoint) => ({
        value: endpoint.url,
        label: endpoint.label,
      })) ?? [],
    [graphQLEndpoints],
  );

  const [endpoint, setEndpoint] = useState(selections[0].value);

  // Typically we would put this in core, but it's only used here
  const fetcher: Fetcher = useDeepCompareCallback(
    async (graphQLParams) => {
      let accessToken = undefined;
      if (process.env.NODE_ENV === 'development') {
        accessToken = getCookie('credentials_token');
      }

      const response = await fetch(`${GEN3_API}/${endpoint}`, {
        method: 'POST',
        ...headers,
        ...(accessToken && { credentials: 'include' }),
        headers: {
          ...(headers as Record<string, string>),
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify(graphQLParams),
      });
      if (!response.ok) {
        throw new Error(
          `GraphQL request failed: ${response.status} ${response.statusText}`,
        );
      }
      return response.json().catch(() => response.text());
    },
    [endpoint, headers],
  );

  return (
    <div className="flex flex-col w-full">
      {selections.length > 1 && (
        <div className="flex items-center justify-end mx-2 mt-2">
          <SegmentedControl
            data={selections}
            value={endpoint}
            onChange={(selectedOption) => setEndpoint(selectedOption)}
            color="accent.5"
            size="md"
          />
        </div>
      )}
      {csrfToken ? (
        <GraphiQL fetcher={fetcher} />
      ) : (
        <div
          role="status"
          aria-label="Loading query editor"
          className="flex flex-1 items-center justify-center"
        >
          <Text c="dimmed">Loading...</Text>
        </div>
      )}
    </div>
  );
};

export default GqlQueryEditor;
