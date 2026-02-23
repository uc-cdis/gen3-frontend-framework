import React, { useEffect, useRef } from 'react';
import { Grid } from '@mantine/core';
import {
  FilterSet,
  HistogramDataAsStringKey,
  StatValues,
  usePrevious,
} from '@gen3/core';

import CDaveCard from './CDaveCard/CDaveCard';
import { useDeepCompareMemo } from 'use-deep-compare';
import { ClinicalDataFacetProps } from './types';

interface DashboardProps {
  readonly cohortFilters: FilterSet;
  readonly activeFields: Array<ClinicalDataFacetProps>;
  readonly results: Record<
    string,
    Array<HistogramDataAsStringKey> | StatValues
  >;
  readonly updateFields: (field: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  cohortFilters,
  activeFields,
  results,
  updateFields,
}: DashboardProps) => {
  const initialDashboardRender = useRef(true);
  const lastDashboardRender = usePrevious(initialDashboardRender);
  const filters = useDeepCompareMemo(
    () => cohortFilters && [cohortFilters],
    [cohortFilters],
  );
  /* -- TOO: reenable when Survival Plot is ready
  const {
    data: survivalData,
    isError,
    isFetching,
    isUninitialized,
  } = useGetSurvivalPlotQuery({
    filters: filters.map((x: Operation) => convertFilterToGqlFilter(x)),
  });
  --- */

  useEffect(() => {
    if (lastDashboardRender) {
      initialDashboardRender.current = false;
    }
  });

  console.log('Dashboard results: ', results, activeFields);

  return (
    <Grid gutter={24} grow={false} overflow="visible">
      {/* --- TODO: reenable when Survival Plot is ready
      <Grid.Col span={{ base: 12, lg: 6 }}>
        <div
          data-testid="overall-survival-plot"
          className="h-full border-1 border-base-lighter p-4"
        >
          {isError ? (
            <Alert>Something&pos;s gone wrong</Alert>
          ) : isFetching || isUninitialized ? (
            <Loader />
          ) : (
            <SurvivalPlot
              data={survivalData ?? EmptySurvivalPlot}
              title="Overall Survival"
              plotType={SurvivalPlotTypes.overall}
              downloadFileName={`overall-survival-plot.${getFormattedTimestamp()}`}
            />
          )}
        </div>
        </Grid.Col>
        --- */}
      {activeFields.map((facet) => {
        return (
          <Grid.Col span={{ base: 12, lg: 6 }} key={facet.field}>
            <CDaveCard
              facet={facet}
              data={results[facet.field]}
              updateFields={updateFields}
              initialDashboardRender={initialDashboardRender.current}
              cohortFilters={cohortFilters}
              color={facet.color}
            />
          </Grid.Col>
        );
      })}
    </Grid>
  );
};

export default Dashboard;
