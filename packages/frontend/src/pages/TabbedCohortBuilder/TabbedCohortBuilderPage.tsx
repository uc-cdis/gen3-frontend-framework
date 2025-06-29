import React from 'react';
import {
  NavPageLayout,
  type NavPageLayoutProps,
} from '../../features/Navigation';
import TabbedCohortBuilder from '../../features/CohortBuilder/TabbedCohortBuilder';

const TabbedCohortBuilderPage = ({
  headerProps,
  footerProps,
}: NavPageLayoutProps): JSX.Element => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerData={{
        title: 'Gen3 Explorer Page',
        content: 'Explorer Page',
        key: 'gen3-explorer-page',
      }}
    >
      <TabbedCohortBuilder index={'cases'} />
    </NavPageLayout>
  );
};

export default TabbedCohortBuilderPage;
