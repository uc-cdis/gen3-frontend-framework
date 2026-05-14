import React, { JSX } from 'react';
import dynamic from 'next/dynamic';
import FixedNavPageLayout from '../../features/Navigation/FixedNavPageLayout';
import { QueryPageLayoutProps } from './types';

const QueryPanel = dynamic(() => import('../../features/Query/QueryPanel'), {
  ssr: false,
});

const QueryPage = ({
  headerProps,
  footerProps,
  configuration: queryProps,
}: QueryPageLayoutProps): JSX.Element => {
  console.log(queryProps);
  return (
    <FixedNavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Query Page',
        content: 'Query page',
        key: 'gen3-query-page',
        ...(queryProps?.headerMetadata ? queryProps.headerMetadata : {}),
      }}
    >
      <QueryPanel graphQLEndpoints={queryProps.graphQLEndpoints} />
    </FixedNavPageLayout>
  );
};

export default QueryPage;
