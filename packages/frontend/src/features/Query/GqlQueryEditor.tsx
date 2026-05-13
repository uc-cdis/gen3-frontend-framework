import React, { ReactElement } from 'react';
import { GraphiQL } from 'graphiql';
import { useDeepCompareCallback } from 'use-deep-compare';
import type { Fetcher } from '@graphiql/toolkit';
import { Text } from '@mantine/core';
import { GEN3_GUPPY_API, selectCSRFToken, selectHeadersWithCSRFToken, useCoreSelector, } from '@gen3/core';
import { GqlQueryEditorProps } from './types';
import 'graphiql/setup-workers/webpack';


/**
 * Fetches graphql data from a graphql endpoint if one is specified, or guppy by default.
 * @param graphQLEndpoint - The location of the graphql endpoint.
 * @returns a component containing a GraphiQl editor
 */
const GqlQueryEditor = ({
  graphQLEndpoint,
}: GqlQueryEditorProps): ReactElement => {
  const headers = useCoreSelector(selectHeadersWithCSRFToken);
  const csrfToken = useCoreSelector(selectCSRFToken);

  const endpoint = graphQLEndpoint ?? `${GEN3_GUPPY_API}/graphql`;

  // Typically we would put this in core but it's only used here
  const fetcher: Fetcher = useDeepCompareCallback(
    async (graphQLParams) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
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
