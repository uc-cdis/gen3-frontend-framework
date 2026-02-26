import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import TabbedCohortBuilder from '../../features/CohortBuilder/TabbedCohortBuilder';
import CohortManager from '../../features/CohortBuilder/CohortManager/CohortManager';
import QueryExpression from '../../features/CohortBuilder/QueryExpression';
import { Stack } from '@mantine/core';
import { TabbedCohortBuilderPageProps } from './types';
import CountsPanel from '../../features/CountsPanel/CountsPanel';

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
          <CohortManager
            rightPanel={
              <CountsPanel
                index={configuration.index}
                indexPrefix={configuration?.indexPrefix}
                unitTypename={configuration?.dataTypename ?? 'Case'}
              />
            }
          />
          <QueryExpression index={configuration.index}></QueryExpression>
        </div>
        <div className="w-full mt-80 mr-4">
          <TabbedCohortBuilder {...configuration} />
        </div>
      </Stack>
    </NavPageLayout>
  );
};

export default TabbedCohortBuilderPage;
