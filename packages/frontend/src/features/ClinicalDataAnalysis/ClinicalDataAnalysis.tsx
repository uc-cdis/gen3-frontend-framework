import React, { useState } from 'react';
import { LoadingOverlay } from '@mantine/core';
import {
  Accessibility,
  EmptyFilterSet,
  filterSetToOperation,
  Operation,
  selectCohortFilters,
  useCoreSelector,
} from '@gen3/core';

import { useClinicalAnalysisQuery } from './useClinicalAnalysisQuery';

// import { useClinicalFieldsQuery, useGetClinicalAnalysisQuery } from '@/core/features/clinicalDataAnalysis'
import Controls from './Controls';
import Dashboard from './Dashboard';
import { combineAnalysisResults, filterUsefulFacets } from './utils';
import { useDeepCompareCallback, useDeepCompareMemo } from 'use-deep-compare';
import { ClinicalDataConfiguration, ClinicalDataFacetProps } from './types';

const ClinicalDataAnalysis = ({
  tabs,
  initialFields,
  uniqueIdField,
  dataTypename,
  index,
}: ClinicalDataConfiguration) => {
  const [controlsExpanded, setControlsExpanded] = useState(true);
  const [accessLevel] = useState<Accessibility>(Accessibility.ALL);
  const [activeFields, setActiveFields] = useState(initialFields); // the fields that have been selected by the user

  const allCDaveFields = tabs.reduce(
    (acc: Record<string, ClinicalDataFacetProps>, tab) => {
      tab.facets.forEach(
        (t) =>
          (acc[t.field] = {
            ...t,
            color: tab.color,
            uniqueIdField: uniqueIdField,
            dataTypename: dataTypename,
            index: index,
          } as ClinicalDataFacetProps),
      );
      return acc;
    },
    {},
  );

  const activeCDaveFields = useDeepCompareMemo(() => {
    return activeFields.map((f) => allCDaveFields[f]);
  }, [activeFields, allCDaveFields]);

  const cDaveStatsFields = useDeepCompareMemo(
    () =>
      Object.values(allCDaveFields)
        .filter((f) => f.cardType == 'continuous')
        .map((x) => x.field),
    [allCDaveFields],
  );

  const allCohortFilters = useCoreSelector((state) =>
    selectCohortFilters(state),
  );
  const currentCohortFilters = allCohortFilters[index] ?? EmptyFilterSet;

  const cohortFilters = useDeepCompareMemo(
    () =>
      filterSetToOperation(currentCohortFilters) ??
      ({ operator: 'and', operands: [] } satisfies Operation),
    [currentCohortFilters],
  );
  const facets = useDeepCompareMemo(
    () => Object.values(allCDaveFields).map((f) => f.field),
    [allCDaveFields],
  );

  const { cDaveAggResults, cDaveStatsResults, isFetching, isError, isSuccess } =
    useClinicalAnalysisQuery({
      type: index,
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
    <div data-testid="clinical-data-analysis-page">
      <div className="flex gap-4 pt-4 pb-16 px-4 w-full">
        <LoadingOverlay
          loaderProps={{ size: 'xl', color: 'primary' }}
          visible={isFetching}
          data-testid="please_wait_spinner"
          zIndex={0}
        />
        <Controls
          tabs={tabs}
          updateFields={updateFields}
          fieldsWithData={Object.keys(filterUsefulFacets(convertedData))}
          activeFields={activeFields}
          controlsExpanded={controlsExpanded}
          setControlsExpanded={setControlsExpanded}
        />
        {isSuccess && Object.keys(convertedData).length > 0 && (
          <Dashboard
            activeFields={activeCDaveFields}
            cohortFilters={currentCohortFilters}
            results={convertedData}
            updateFields={updateFields}
          />
        )}
      </div>
    </div>
  );
};

export default ClinicalDataAnalysis;
