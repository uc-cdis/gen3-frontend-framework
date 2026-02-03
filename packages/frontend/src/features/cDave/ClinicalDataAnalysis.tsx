import React, { useState } from 'react';
import { LoadingOverlay } from '@mantine/core';
import {
  Accessibility,
  filterSetToOperation,
  Operation,
  useCoreSelector,
} from '@gen3/core';

import { useClinicalAnalysisQuery } from './useClinicalAnalysisQuery';

// import { useClinicalFieldsQuery, useGetClinicalAnalysisQuery } from '@/core/features/clinicalDataAnalysis'
import Controls from './Controls';
import Dashboard from './Dashboard';
import { DEFAULT_FIELDS, FACET_SORT } from './constants';
import {
  combineAnalysisResults,
  filterUsefulFacets,
  parseFieldName,
} from './utils';
import { useDeepCompareCallback, useDeepCompareMemo } from 'use-deep-compare';
import { selectCurrentCohortCaseFilters } from '@/core/utils';
import { COHORT_FILTER_INDEX } from '@/core';

const ClinicalDataAnalysis: React.FC = () => {
  const [controlsExpanded, setControlsExpanded] = useState(true);
  const [accessLevel] = useState<Accessibility>(Accessibility.ALL);
  const [activeFields, setActiveFields] = useState(DEFAULT_FIELDS); // the fields that have been selected by the user

  const cDaveFields = useDeepCompareMemo(
    () =>
      Object.values(fields || {})
        .map((d) => ({ ...d, ...parseFieldName(d.name) }))
        .filter(
          (d) =>
            FACET_SORT?.[d.field_type] &&
            FACET_SORT[d.field_type].includes(d.field_name),
        ),
    [fields],
  );

  const cDaveStatsFields = useDeepCompareMemo(
    () =>
      cDaveFields
        .filter((f) => f.type.name == 'NumericAggregations')
        .map((x) => x.full),
    [cDaveFields],
  );

  const currentCohortFilters = useCoreSelector((state) =>
    selectCurrentCohortCaseFilters(state, COHORT_FILTER_INDEX),
  );

  const cohortFilters = useDeepCompareMemo(
    () =>
      filterSetToOperation(currentCohortFilters) ??
      ({ operator: 'and', operands: [] } satisfies Operation),
    [currentCohortFilters],
  );
  const facets = useDeepCompareMemo(
    () => cDaveFields.map((f) => f.full),
    [cDaveFields],
  );

  const { cDaveAggResults, cDaveStatsResults, isFetching, isError, isSuccess } =
    useClinicalAnalysisQuery({
      type: COHORT_FILTER_INDEX,
      aggFields: facets,
      statsFields: cDaveStatsFields,
      filters: currentCohortFilters,
      accessibility: accessLevel,
    });

  const convertedData = useDeepCompareMemo(
    () =>
      combineAnalysisResults(cDaveAggResults ?? {}, cDaveStatsResults ?? {}),
    [cDaveAggResults, cDaveStatsResults],
  );

  const updateFields = useDeepCompareCallback(
    (field: string) => {
      if (activeFields.includes(field)) {
        setActiveFields(activeFields.filter((f) => f !== field));
      } else {
        setActiveFields([...activeFields, field]);
      }
    },
    [activeFields],
  );

  if (isError) {
    return (
      <div className="flex relative justify-center items-center h-screen/2">
        <div className="flex flex-col items-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Something&apos;s gone wrong</h1>
          </div>
          <div className="text-center">
            <p className="text-lg">
              Please try again later or contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-4 pt-4 pb-16 px-4 w-full">
        <LoadingOverlay
          loaderProps={{ size: 'xl', color: 'primary' }}
          visible={isFetching}
          data-testid="please_wait_spinner"
          zIndex={0}
        />
        <Controls
          updateFields={updateFields}
          cDaveFields={cDaveFields}
          fieldsWithData={filterUsefulFacets(convertedData)}
          activeFields={activeFields}
          controlsExpanded={controlsExpanded}
          setControlsExpanded={setControlsExpanded}
        />
        {isSuccess && Object.keys(convertedData).length > 0 && (
          <Dashboard
            activeFields={activeFields}
            cohortFilters={cohortFilters}
            results={convertedData}
            updateFields={updateFields}
          />
        )}
      </div>
    </>
  );
};

export default ClinicalDataAnalysis;
