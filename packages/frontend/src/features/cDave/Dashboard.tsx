import React, { useEffect, useRef } from 'react';
import { Alert, Grid, Loader } from '@mantine/core';
import {
  Buckets,
  convertFilterToGqlFilter,
  Operation,
  Stats,
  usePrevious,
} from '@gen3/core';

import { getFormattedTimestamp } from '../../utils/date';
// import { useGetSurvivalPlotQuery } from '@/core/features/survival';
// import { EmptySurvivalPlot } from '@/core/features/survival/types';
// import { SurvivalPlotTypes } from '../charts/SurvivalPlot/types';
//import SurvivalPlot from '../charts/SurvivalPlot/SurvivalPlot';
import CDaveCard from './CDaveCard/CDaveCard';
import { useDeepCompareMemo } from 'use-deep-compare';

interface DashboardProps {
  readonly cohortFilters: Operation;
  readonly activeFields: string[];
  readonly results: Record<string, Buckets | Stats>;
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
  const {
    data: survivalData,
    isError,
    isFetching,
    isUninitialized,
  } = useGetSurvivalPlotQuery({
    filters: filters.map((x: Operation) => convertFilterToGqlFilter(x)),
  });

  useEffect(() => {
    if (lastDashboardRender) {
      initialDashboardRender.current = false;
    }
  });

  return (
    <Grid gutter={24} overflow="hidden" className="flex-grow">
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
      {activeFields.map((field) => {
        return (
          <Grid.Col span={{ base: 12, lg: 6 }} key={field}>
            <CDaveCard
              field={field}
              data={results[field]}
              updateFields={updateFields}
              initialDashboardRender={initialDashboardRender.current}
              cohortFilters={cohortFilters}
              color={color}
            />
          </Grid.Col>
        );
      })}
    </Grid>
  );
};

export default Dashboard;
