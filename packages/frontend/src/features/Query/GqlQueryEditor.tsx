'use client';
//import { useState } from 'react';
import GraphiQL from 'graphiql';
import type {
  Fetcher,
  // FetcherOpts,
  // FetcherParams,
  // FetcherReturnType,
} from '@graphiql/toolkit';
//import { GEN3_API, JSONObject, useGraphQLQuery } from '@gen3/core';
import { GEN3_API } from '@gen3/core';

// const useGraphGLQueryReturningFetcher = (
//   graphQLParams: FetcherParams,
//   opts?: FetcherOpts,
// ): FetcherReturnType => {
//   const { data, isError, isFetching, isSuccess } =
//     useGraphQLQuery({  query: graphQLParams.query, variables: graphQLParams.variables });
//   return {
//     data,
//   };
// };

interface GqlQueryEditorProps {
  graphQLEndpoint?: string;
}

const GqlQueryEditor = ( ) => {
//  const [query, setQuery] = useState<JSONObject>({});
//  const [variable, setVariables] = useState<JSONObject>({});

  const fetcher: Fetcher = async (graphQLParams) => {
    const data = await fetch( `${GEN3_API}/graphql`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(graphQLParams),
    });
    return data.json().catch(() => data.text());
  };

  return (
    <div className="h-full">
      <GraphiQL fetcher={fetcher} />
    </div>
  );
};

export default GqlQueryEditor;
