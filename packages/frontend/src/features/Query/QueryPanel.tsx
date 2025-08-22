import React from 'react';
import GqlQueryEditor from './GqlQueryEditor';

// Wrapper function for displaying loading element before GqlQueryEditor renders

interface QueryPanelProps {
  graphQLEndpoint?: string;
  title?: string;
}

const QueryPanel = ({ graphQLEndpoint }: QueryPanelProps) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return <GqlQueryEditor graphQLEndpoint={graphQLEndpoint} />;
};

export default QueryPanel;
