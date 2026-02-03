// hooks/useClinicalData.ts
import { useDeepCompareMemo } from 'use-deep-compare';
import {
  Accessibility,
  AggregationsData,
  FilterSet,
  StatsData,
  useGetAggsQuery,
  useGetStatsAggregationsQuery,
} from '@gen3/core';

interface UseClinicalDataParams {
  type: string;
  aggFields: string[];
  statsFields: string[];
  filters: FilterSet;
  accessibility: Accessibility;
}

interface UseClinicalDataReturn {
  // Aggregation data
  cDaveAggResults?: AggregationsData;
  // Stats data
  cDaveStatsResults?: StatsData;

  // Combined states
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  error?: any;
}

export const useClinicalAnalysisQuery = ({
  type,
  aggFields,
  statsFields,
  filters,
  accessibility,
}: UseClinicalDataParams): UseClinicalDataReturn => {
  const {
    data: cDaveAggResults,
    isSuccess: isAggsSuccess,
    isFetching: isAggsFetching,
    isError: isAggsError,
    error: aggsError,
  } = useGetAggsQuery({
    type,
    fields: aggFields,
    filters,
    accessibility,
    filterSelf: true,
    indexPrefix: 'CaseCentric_',
  });

  const {
    data: cDaveStatsResults,
    isSuccess: isStatsSuccess,
    isFetching: isStatsFetching,
    isError: isStatsError,
    error: stastsError,
  } = useGetStatsAggregationsQuery({
    type,
    fields: statsFields,
    filters,
    accessibility,
    filterSelf: true,
    indexPrefix: 'CaseCentric_',
  });

  // Memoized combined states
  const combinedStates = useDeepCompareMemo(
    () => ({
      isFetching: isAggsFetching || isStatsFetching,
      isError: isAggsError || isStatsError,
      isSuccess: isAggsSuccess && isStatsSuccess,
      error: aggsError || stastsError,
    }),
    [
      isAggsFetching,
      isStatsFetching,
      isAggsError,
      isStatsError,
      isAggsSuccess,
      isStatsSuccess,
    ],
  );

  return {
    // Individual query results
    cDaveAggResults,
    cDaveStatsResults,
    // Combined states
    ...combinedStates,
  };
};
