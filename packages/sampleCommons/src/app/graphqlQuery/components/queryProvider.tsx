'use client';
import React, { createContext, useContext } from 'react';
import { QueryProps } from '@gen3/frontend';

const QueryContext = createContext<QueryProps>({
  graphQLEndpoint: undefined,
});

interface QueryContextProps {
  configuration: QueryProps;
  children: React.ReactNode;
}

export function QueryProvider({ children, configuration }: QueryContextProps) {
  return (
    <QueryContext.Provider value={configuration}>
      {children}
    </QueryContext.Provider>
  );
}

export function useQueryContext() {
  return useContext(QueryContext);
}
