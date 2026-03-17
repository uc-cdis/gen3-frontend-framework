import React, { useState } from 'react';
import { pickBy } from 'lodash';
import { LoadingOverlay } from '@mantine/core';
import { convertFilterSetToGqlFilter, FilterSet } from '@gen3/core';
import { useCohortFacetsQuery } from '@/core/features/cohortComparison';

import CohortCard from './CohortCard/CohortCard';
import SurvivalCard from './SurvivalCard';
import FacetCard from './FacetCard';
import { DemoText } from '@/components/tailwindComponents';
import { CohortComparisonFields } from './types';

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

interface CohortComparisonProps {
  readonly cohorts: CohortComparisonType;
  readonly demoMode: boolean;
}

const fields = {
  survival: 'Survival',
  ethnicity: 'demographic.ethnicity',
  gender: 'demographic.gender',
  race: 'demographic.race',
  vital_status: 'demographic.vital_status',
  age_at_diagnosis: 'diagnoses.age_at_diagnosis',
};

const CohortComparison: React.FC<CohortComparisonProps> = ({
  cohorts,
  demoMode = false,
}: CohortComparisonProps) => {
  const [selectedCards, setSelectedCards] = useState({
    survival: true,
    ethnicity: false,
    gender: true,
    race: true,
    vital_status: true,
    age_at_diagnosis: true,
  } as Record<string, boolean>);

  const [survivalPlotSelectable, setSurvivalPlotSelectable] = useState(true);
  const fieldsToQuery = Object.values(fields).filter((v) => v !== 'Survival');

  const {
    data: cohortFacetsData,
    isFetching: cohortFacetsFetching,
    isLoading: cohortFacetsLoading,
    isUninitialized: cohortFacetsUninitialized,
  } = useCohortFacetsQuery({
    index: 'case_centric',
    continuousFacets: ['diagnoses.age_at_diagnosis'],
    facetFields: fieldsToQuery,
    primaryCohort: convertFilterSetToGqlFilter(cohorts.primary_cohort.filter),
    comparisonCohort: convertFilterSetToGqlFilter(
      cohorts.comparison_cohort.filter,
    ),
  });

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
          {selectedCards.survival && (
            <div className="border-1 border-base-lighter">
              <SurvivalCard
                cohorts={cohorts}
                counts={counts}
                setSurvivalPlotSelectable={setSurvivalPlotSelectable}
                isSetsloading={false}
              />
            </div>
          )}
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
                  cohortFacetsLoading
                }
                zIndex={1} // need z-index 1
              />
              <FacetCard
                data={
                  cohortFacetsData?.aggregations
                    ? cohortFacetsData.aggregations.map(
                        (d: any) => d[CohortComparisonFields[selectedCard]],
                      )
                    : []
                }
                field={CohortComparisonFields[selectedCard]}
                counts={counts}
                cohorts={cohorts}
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
            options={fields}
            survivalPlotSelectable={survivalPlotSelectable}
            casesFetching={cohortFacetsFetching}
          />
        </div>
      </div>
    </div>
  );
};

export default CohortComparison;
