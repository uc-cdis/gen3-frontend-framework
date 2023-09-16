import dynamic from 'next/dynamic';
import React from 'react';
import { LoadingOverlay } from '@mantine/core';

const GqlQueryEditor = dynamic(() => import('./GqlQueryEditor'), {
  loading: () => <LoadingOverlay visible={true} />,
  ssr: false,
});

interface QueryPanelProps {
  graphQLEndpoint?: string;
  title?: string;
}

const QueryPanel: React.FC<QueryPanelProps> = ({
  graphQLEndpoint,
}: QueryPanelProps) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return <GqlQueryEditor graphQLEndpoint={graphQLEndpoint} />;
};

export default QueryPanel;
