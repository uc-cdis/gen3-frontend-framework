import React, { useContext, useState } from 'react';
import {
  type Cohort,
  EmptyFilterSet,
  selectCohortById,
  selectCohortIds,
  selectCurrentCohort,
  useCoreSelector,
  usePrevious,
} from '@gen3/core';
import { useDeepCompareEffect } from 'use-deep-compare';
import { SelectionScreenContext } from '@/components/analysis';
import CohortComparison from './CohortComparison';
import AdditionalCohortSelection from './AdditionalCohortSelection';
import { COHORT_FILTER_INDEX } from '@/core';

const CohortComparisonApp = () => {
  const { selectionScreenOpen, setSelectionScreenOpen, app, setActiveApp } =
    useContext(SelectionScreenContext);

  const allCohortsIds = useCoreSelector(selectCohortIds);

  const primaryCohort = useCoreSelector((state) => selectCurrentCohort(state));

  const [comparisonCohort, setComparisonCohort] = useState<Cohort>();
  const comparisonCohortObj: Cohort | null = useCoreSelector((state) =>
    comparisonCohort?.id ? selectCohortById(state, comparisonCohort.id) : null,
  );
  const comparisonCohortFilter = comparisonCohortObj?.filters;
  /* Comparison Cohort Details End */

  const cohorts = {
    primary_cohort: {
      filter:
        primaryCohort.filters && COHORT_FILTER_INDEX in primaryCohort.filters
          ? primaryCohort.filters[COHORT_FILTER_INDEX]
          : EmptyFilterSet,
      name: primaryCohort.name ?? 'uninitialize',
      id: primaryCohort.id ?? 'uninitialized',
      counts: primaryCohort.counts?.[COHORT_FILTER_INDEX] ?? 0,
    },
    comparison_cohort: {
      filter:
        comparisonCohortFilter && COHORT_FILTER_INDEX in comparisonCohortFilter
          ? comparisonCohortFilter[COHORT_FILTER_INDEX]
          : EmptyFilterSet,
      name: comparisonCohort?.name ?? 'uninitialize',
      id: comparisonCohort?.id ?? 'uninitialize',
      counts: comparisonCohort?.counts?.[COHORT_FILTER_INDEX] ?? 0,
    },
  };

  const prevPrimaryCohortId = usePrevious<string | undefined>(
    primaryCohort?.id,
  );
  const prevComparisonCohortId = usePrevious<string | undefined>(
    comparisonCohort?.id,
  );

  useDeepCompareEffect(() => {
    if (
      (prevPrimaryCohortId && !allCohortsIds.includes(prevPrimaryCohortId)) ||
      (prevComparisonCohortId &&
        !allCohortsIds.includes(prevComparisonCohortId))
    ) {
      if (setSelectionScreenOpen) setSelectionScreenOpen(true);
    }
  }, [
    allCohortsIds,
    prevPrimaryCohortId,
    prevComparisonCohortId,
    setSelectionScreenOpen,
  ]);

  return selectionScreenOpen ? (
    <AdditionalCohortSelection
      app={app}
      setOpen={setSelectionScreenOpen}
      setActiveApp={setActiveApp}
      setComparisonCohort={setComparisonCohort}
      index={COHORT_FILTER_INDEX}
    />
  ) : (
    <CohortComparison cohorts={cohorts} demoMode={false} />
  );
};

export default CohortComparisonApp;
