import React from 'react';
import {
  Accessibility,
  CoreState,
  selectCurrentCohortId,
  selectIndexFilters,
  useCoreSelector,
  useLazyGetCountsQuery,
} from '@gen3/core';
import { useDeepCompareEffect } from 'use-deep-compare';
import CountsValue from '../../components/counts/CountsValue';

export interface CountsPanelProps {
  index: string;
  unitTypename: string;
  accessibility?: Accessibility;
  indexPrefix?: string;
}

const CountsPanel: React.FC<CountsPanelProps> = ({
  index,
  unitTypename,
  accessibility = Accessibility.ALL,
  indexPrefix = '',
}: CountsPanelProps) => {
  const [getCounts, { data: counts, isFetching, isError }] =
    useLazyGetCountsQuery();
  const currentCohortId = useCoreSelector((state: CoreState) =>
    selectCurrentCohortId(state),
  );
  const cohortFilters = useCoreSelector((state: CoreState) =>
    selectIndexFilters(state, index),
  );

  useDeepCompareEffect(() => {
    void getCounts({
      type: index,
      filters: cohortFilters,
      accessibility: accessibility,
      queryId: currentCohortId,
      indexPrefix: indexPrefix,
    });
  }, [cohortFilters, currentCohortId, accessibility]);

  return (
    <CountsValue
      label={unitTypename}
      counts={counts}
      isFetching={isFetching}
      isError={isError}
    />
  );
};

export default CountsPanel;
