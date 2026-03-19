import React, { useState } from 'react';
import { pickBy } from 'lodash';
import { LoadingOverlay } from '@mantine/core';
import {
  convertFilterSetToGqlFilter,
  FilterSet,
  useCohortFacetsQuery,
} from '@gen3/core';

import CohortCard from './CohortCard/CohortCard';
import FacetCard from './FacetCard';
import { CohortComparisonConfiguration } from './types';
import { DemoText } from '../../components/tailwindComponents';

export interface CohortComparisonType {
  primary_cohort: {
    filter: FilterSet;
    name: string;
    id: string;
    counts: number;
  };
  comparison_cohort: {
    filter: FilterSet;
    name: string;
    id: string;
    counts: number;
  };
}

interface CohortComparisonProps extends CohortComparisonConfiguration {
  cohorts: CohortComparisonType;
  demoMode: boolean;
}

const CohortComparison: React.FC<CohortComparisonProps> = ({
  index,
  dataTypename,
  uniqueIdField,
  facets,
  cohorts,
  demoMode = false,
}: CohortComparisonProps) => {
  const facetCards = facets.reduce(
    (acc, facet) => {
      acc[facet.field] = true;
      return acc;
    },
    {} as Record<string, boolean>,
  );

  const [selectedCards, setSelectedCards] =
    useState<Record<string, boolean>>(facetCards);

  const [survivalPlotSelectable, setSurvivalPlotSelectable] = useState(true);
  const fieldsToQuery = facets.map((f) => f.field);

  const {
    data: cohortFacetsData,
    isFetching: cohortFacetsFetching,
    isLoading: cohortFacetsLoading,
    isUninitialized: cohortFacetsUninitialized,
    isError: cohortFacetsError,
  } = useCohortFacetsQuery({
    index,
    continuousFacets: ['diagnoses.age_at_diagnosis'],
    facetFields: fieldsToQuery,
    primaryCohort: convertFilterSetToGqlFilter(cohorts.primary_cohort.filter),
    comparisonCohort: convertFilterSetToGqlFilter(
      cohorts.comparison_cohort.filter,
    ),
  });

  console.log('cohortFacetsData', cohortFacetsData);
  console.log('cohortFacetsError', cohortFacetsError);

  const counts = [
    cohorts.primary_cohort.counts,
    cohorts.comparison_cohort.counts,
  ];

  return (
    <div className="mt-6 px-4 mb-16">
      {demoMode && (
        <DemoText>
          Demo showing cases with low grade gliomas with and without mutations
          in the genes IDH1 and IDH2.
        </DemoText>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="flex flex-col gap-y-4 lg:col-span-3 order-2 lg:order-1">
          {Object.keys(
            pickBy(selectedCards, (v, k) => v && k !== 'survival'),
          ).map((selectedCard) => (
            <div
              className="relative border-1 border-base-lighter"
              key={selectedCard}
            >
              <LoadingOverlay
                data-testid="loading-spinner"
                visible={
                  cohortFacetsFetching ||
                  cohortFacetsUninitialized ||
                  cohortFacetsLoading ||
                  cohortFacetsData === undefined
                }
                zIndex={1} // need z-index 1
              />
              <FacetCard
                data={[]}
                field={selectedCard}
                counts={counts}
                cohorts={cohorts}
                dataTypename={dataTypename}
                uniqueIdField={uniqueIdField}
                index={index}
              />
            </div>
          ))}
        </div>
        <div className="lg:col-span-2 order-1 lg:order-2">
          <CohortCard
            selectedCards={selectedCards}
            setSelectedCards={setSelectedCards}
            counts={counts}
            cohorts={cohorts}
            options={{}}
            index={index}
            survivalPlotSelectable={survivalPlotSelectable}
            objectsFetching={cohortFacetsFetching}
          />
        </div>
      </div>
    </div>
  );
};

export default CohortComparison;
