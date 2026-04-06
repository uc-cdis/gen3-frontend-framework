import React, { JSX } from 'react';
import dynamic from 'next/dynamic';
import { NavPageLayout } from '../../features/Navigation';
import { QueryPageLayoutProps } from './types';

const QueryPanel = dynamic(() => import('../../features/Query/QueryPanel'), {
  ssr: false,
});

const QueryPage = ({
  headerProps,
  footerProps,
  queryProps,
}: QueryPageLayoutProps): JSX.Element => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Query Page',
        content: 'Query page',
        key: 'gen3-query-page',
        ...(queryProps?.headerMetadata ? queryProps.headerMetadata : {}),
      }}
    >
      <QueryPanel graphQLEndpoint={queryProps.graphQLEndpoint} />
    </NavPageLayout>
  );
};

export default QueryPage;
