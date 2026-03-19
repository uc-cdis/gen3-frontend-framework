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
import { SelectionScreenContext } from '../Analysis/context';
import CohortComparison from './CohortComparison';
import AdditionalCohortSelection from './AdditionalCohortSelection';
import { CohortComparisonConfiguration } from './types';
import { ErrorCard } from '../../index';

const VoidFunction = () => {};

const CohortComparisonApp = (configuration: CohortComparisonConfiguration) => {
  const { index: COHORT_FILTER_INDEX, dataTypename } = configuration;
  const { selectionScreenOpen, setSelectionScreenOpen, setActiveApp } =
    useContext(SelectionScreenContext);

  const allCohortsIds = useCoreSelector(selectCohortIds);

  const primaryCohort = useCoreSelector((state) => selectCurrentCohort(state));

  const [comparisonCohort, setComparisonCohort] = useState<Cohort | undefined>(
    undefined,
  );
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
      setOpen={setSelectionScreenOpen ?? VoidFunction}
      setActiveApp={setActiveApp ?? VoidFunction}
      setComparisonCohort={setComparisonCohort}
      index={COHORT_FILTER_INDEX}
      dataTypename={configuration.dataTypename}
    />
  ) : comparisonCohort ? (
    <CohortComparison cohorts={cohorts} demoMode={false} {...configuration} />
  ) : (
    <ErrorCard message="No cohort available" />
  );
};

export default CohortComparisonApp;
