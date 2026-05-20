'use client';
import dynamic from 'next/dynamic';
import React from 'react';
import { LoadingOverlay } from '@mantine/core';
import type { QueryPanelConfiguration } from './types';

// Wrapper function for displaying loading element before GqlQueryEditor renders
const GqlQueryEditor = dynamic(() => import('./GqlQueryEditor'), {
  loading: () => <LoadingOverlay visible={true} />,
  ssr: false,
});

/**
 * Represents the QueryPanel component responsible for rendering a GraphQL query editor.
 *
 * @param {QueryPanelConfiguration} config - The configuration object for the QueryPanel.
 * @param {Array<{ url: string, label: string }>} [config.graphQLEndpoints=[{ url: 'guppy/graphql', label: 'Flat' }]]
 *        An array of GraphQL endpoint objects. Each endpoint object contains the following:
 *        - `url` (string): The URL of the GraphQL endpoint. Note this should only be the Gen3 service path (e.g., 'guppy/graphql').
 *        - `label` (string): A label for the GraphQL endpoint.
 *
 * @returns {React.Element} The rendered GraphQL query editor.
 */

const QueryPanel = ({
  graphQLEndpoints = [{ url: 'guppy/graphql', label: 'Flat' }],
}: QueryPanelConfiguration) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return <GqlQueryEditor graphQLEndpoints={graphQLEndpoints} />;
};

export default QueryPanel;
