import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import QueryPanel from '../../features/Query/QueryPanel';
import { QueryPageLayoutProps } from './types';

const QueryPage = ({
  headerProps,
  footerProps,
  queryProps,
}: QueryPageLayoutProps): JSX.Element => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerData={{
        title: 'Gen3 Query Page',
        content: 'Query page',
        key: 'gen3-query-page',
      }}
    >
      <QueryPanel graphQLEndpoint={queryProps.graphQLEndpoint} />
    </NavPageLayout>
  );
};

export default QueryPage;
