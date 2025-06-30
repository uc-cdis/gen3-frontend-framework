import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import TabbedCohortBuilder from '../../features/CohortBuilder/TabbedCohortBuilder';
import { TabbedCohortBuilderPageProps } from './types';

const TabbedCohortBuilderPage = ({
  headerProps,
  footerProps,
  configuration,
}: TabbedCohortBuilderPageProps): JSX.Element => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerData={{
        title: 'Gen3 Tabbed Cohort Builder Page',
        content: 'Tabbed Cohort Builder Page',
        key: 'gen3-tabbed-cohort-builder-page',
      }}
    >
      <TabbedCohortBuilder {...configuration} />
    </NavPageLayout>
  );
};

export default TabbedCohortBuilderPage;
