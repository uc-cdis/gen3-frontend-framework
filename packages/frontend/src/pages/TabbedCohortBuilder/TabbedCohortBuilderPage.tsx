import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import TabbedCohortBuilder from '../../features/CohortBuilder/TabbedCohortBuilder';
import CohortManager from '../../features/CohortBuilder/CohortManager/CohortManager';
import QueryExpression from '../../features/CohortBuilder/QueryExpression';
import { Stack } from '@mantine/core';
import { TabbedCohortBuilderPageProps } from './types';
import CountsValue from '../../components/counts/CountsValue';
import {
  Accessibility,
  CoreState,
  selectCurrentCohortId,
  selectIndexFilters,
  useCoreSelector,
  useLazyGetCountsQuery,
} from '@gen3/core';
import { useDeepCompareEffect } from 'use-deep-compare';

interface CountsPanelProps {
  index: string;
  accessibility?: Accessibility;
}

const CountsPanel: React.FC<CountsPanelProps> = ({
  index,
  accessibility = Accessibility.ALL,
}: CountsPanelProps) => {
  const [getCounts, { data: counts, isFetching, isError, isSuccess }] =
    useLazyGetCountsQuery();
  const currentCohortId = useCoreSelector((state: CoreState) =>
    selectCurrentCohortId(state),
  );
  const cohortFilters = useCoreSelector((state: CoreState) =>
    selectIndexFilters(state, index),
  );

  useDeepCompareEffect(() => {
    getCounts({
      type: index,
      filters: cohortFilters,
      accessibility: accessibility,
      queryId: currentCohortId,
    });
  }, [cohortFilters, currentCohortId, accessibility]);

  return (
    <CountsValue
      label="Case"
      counts={counts}
      isFetching={isFetching}
      isError={isError}
    />
  );
};

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
          <CohortManager rightPanel={<CountsPanel index="case" />} />
          <QueryExpression index={configuration.index}></QueryExpression>
        </div>
        <div className="w-full mt-60 mr-4">
          <TabbedCohortBuilder {...configuration} />
        </div>
      </Stack>
    </NavPageLayout>
  );
};

export default TabbedCohortBuilderPage;
