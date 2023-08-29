'use client';
import React, { useState } from 'react';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import GraphiQL from 'graphiql';
import type { Fetcher } from '@graphiql/toolkit';
import { GEN3_API } from '@gen3/core';
import { GqlQueryEditorProps  } from './types';
import { Button } from '@mantine/core';


const GqlQueryEditor = ({ graphQLEndpoint }: GqlQueryEditorProps) => {
  const [query, setQuery] = useState('');

  const fetcher: Fetcher = async (graphQLParams) => {
    const data = await fetch(graphQLEndpoint || `${GEN3_API}/graphql`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(graphQLParams),
    });
    return data.json().catch(() => data.text());
  };

  const explorer = explorerPlugin({
    query: query,
    onEdit: setQuery,
  });

  return (
    <div className="h-full">
      <GraphiQL
        fetcher={fetcher}
        query={query}
        onEditQuery={setQuery}
        plugins={[explorer]}
      >
        <GraphiQL.Toolbar>
          <Button
            onClick={() => {
              alert('Custom button action');
            }}
          >
            Run
          </Button>
        </GraphiQL.Toolbar>
        <GraphiQL.Footer>
          <div>Footer</div>
        </GraphiQL.Footer>
      </GraphiQL>
    </div>
  );
};

export default GqlQueryEditor;
