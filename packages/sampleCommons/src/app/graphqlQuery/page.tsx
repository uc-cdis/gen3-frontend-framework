// app/page.tsx
'use client';
import React from 'react';
import { QueryPanel } from '@gen3/frontend';
import { useQueryContext } from './components/queryProvider';

export default function Page() {
  const queryProps = useQueryContext();
  return (
    <div style={{ height: '100vh' }}>
      <QueryPanel graphQLEndpoint={queryProps.graphQLEndpoint} />
    </div>
  );
}
