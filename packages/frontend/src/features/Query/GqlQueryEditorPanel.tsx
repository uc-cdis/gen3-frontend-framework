import React, { useState } from 'react';
import { Fetcher } from '@graphiql/toolkit';

import { GEN3_API } from '@gen3/core';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import {
  EditorContextProvider,
  ExecutionContextProvider,
  PluginContextProvider,
  QueryEditor,
  ResponseEditor,
  SchemaContextProvider,
} from '@graphiql/react';
import { GqlQueryEditorProps } from './types';

// const useGraphGLQueryReturningFetcher = (
//   graphQLParams: FetcherParams,
//   opts?: FetcherOpts,
// ): FetcherReturnType => {
//   const { data, isError, isFetching, isSuccess } = useGraphQLQuery({
//     query: graphQLParams.query,
//     variables: graphQLParams.variables,
//   });
//   return data ?? {};
// };

const GqlQueryEditorPanel: React.FC<GqlQueryEditorProps> = ({
  graphQLEndpoint,
}: GqlQueryEditorProps) => {
  const [query, setQuery] = useState('');
  //  const [variables, setVariables] = useState"(""");

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
    showAttribution: true,
  });

  return (
    <div className="flex h-full">
      <EditorContextProvider>
        <SchemaContextProvider fetcher={fetcher}>
          <PluginContextProvider plugins={[explorer]}>
            <ExecutionContextProvider fetcher={fetcher}>
              <div className="graphiql-container flex w-100">
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
