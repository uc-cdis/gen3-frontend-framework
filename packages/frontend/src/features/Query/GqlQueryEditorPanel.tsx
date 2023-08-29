import React, { useState } from 'react';
import {
  Fetcher,
  FetcherOpts,
  FetcherParams,
  FetcherReturnType,
} from '@graphiql/toolkit';

import { GEN3_API, useGraphQLQuery } from '@gen3/core';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import {
  EditorContextProvider,
  ExecutionContextProvider,
  PluginContextProvider,
  QueryEditor,
  ResponseEditor,
  SchemaContextProvider,
} from '@graphiql/react';
import { GqlQueryEditorProps } from "./types";

const useGraphGLQueryReturningFetcher = (
  graphQLParams: FetcherParams,
  opts?: FetcherOpts,
): FetcherReturnType => {
  const { data, isError, isFetching, isSuccess } = useGraphQLQuery({
    query: graphQLParams.query,
    variables: graphQLParams.variables,
  });
  return data ?? {};
};

const GqlQueryEditorPanel = ({ graphQLEndpoint }: GqlQueryEditorProps) => {
  const [query, setQuery] = useState('');
  //  const [variable, setVariables] = useState<JSONObject>({});

  // const fetcher = createGraphiQLFetcher({
  //   url: 'https://my.graphql.api/graphql',
  // });

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
    <div className="flex h-full">
      <EditorContextProvider>
        <SchemaContextProvider fetcher={fetcher}>
          <PluginContextProvider plugins={[explorer]}>
            <ExecutionContextProvider fetcher={fetcher}>
              <div className="graphiql-container">
                <QueryEditor />
                <ResponseEditor />
              </div>
            </ExecutionContextProvider>
          </PluginContextProvider>
        </SchemaContextProvider>
      </EditorContextProvider>
    </div>
  );
};

export default GqlQueryEditorPanel;
