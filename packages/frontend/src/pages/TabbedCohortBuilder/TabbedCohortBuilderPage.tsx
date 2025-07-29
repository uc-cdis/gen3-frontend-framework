import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import TabbedCohortBuilder from '../../features/CohortBuilder/TabbedCohortBuilder';
import CohortManager from '../../features/CohortBuilder/CohortManagerAndExpression';
import { Stack } from '@mantine/core';
import { TabbedCohortBuilderPageProps } from './types';

const TabbedCohortBuilderPage = ({
  headerProps,
  footerProps,
  configuration,
}: TabbedCohortBuilderPageProps): JSX.Element => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Tabbed Cohort Builder Page',
        content: 'Tabbed Cohort Builder Page',
        key: 'gen3-tabbed-cohort-builder-page',
      }}
    >
      <Stack align="stretch" classNames={{ root: 'w-full' }}>
        <div className="w-full flex-col flex gap-4 fixed bg-white z-10">
          <CohortManager index={configuration.index}></CohortManager>
        </div>
        <div className="w-full mt-40 mr-4">
          <TabbedCohortBuilder {...configuration} />
        </div>
      </Stack>
    </NavPageLayout>
  );
};

export default TabbedCohortBuilderPage;
