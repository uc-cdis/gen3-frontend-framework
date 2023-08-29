

import dynamic from 'next/dynamic';

const GqlQueryEditor = dynamic(() => import('./GqlQueryEditor'), {
  ssr: false,
});

interface QueryPanelProps {
  graphQLEndpoint?: string;
}

const QueryPanel = ({ graphQLEndpoint }: QueryPanelProps) => {

  return (
    <GqlQueryEditor graphQLEndpoint={graphQLEndpoint}/>
  );
};

export default QueryPanel;
