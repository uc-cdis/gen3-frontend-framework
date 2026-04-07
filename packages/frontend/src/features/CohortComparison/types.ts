import { FacetDefinition, FilterSet, GQLFilter } from '@gen3/core';

export interface GqlIntersection {
  and: ReadonlyArray<GQLFilter>;
}

export interface CohortComparisonType {
  primary_cohort: {
    filter: FilterSet;
    name: string;
    id: string;
  };
  comparison_cohort: {
    filter: FilterSet;
    name: string;
    id: string;
  };
}

export const COHORT_A_COLOR = 'primary.4';
export const COHORT_B_COLOR = 'accent.4';

export interface ComparisonFacetDefinition extends FacetDefinition {
  color: string;
  dataTypename: string;
  uniqueIdField: string;
  isContinuous?: boolean;
}

export interface CohortComparisonConfiguration {
  index: string;
  uniqueIdField: string;
  dataTypename: string;
  facets: Array<ComparisonFacetDefinition>;
}
