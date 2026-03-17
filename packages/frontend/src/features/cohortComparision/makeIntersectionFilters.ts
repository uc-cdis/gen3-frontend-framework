import { GQLFilter } from '@gen3/core';

interface IntersectionFilters {
  cohort1: GQLFilter;
  cohort2: GQLFilter;
}

const makeIntersectionFilters = (
  cohort1Filters?: GQLFilter,
  cohort2Filters?: GQLFilter,
): IntersectionFilters => {
  const cohort1Content: GQLFilter[] = [];
  const cohort2Content: GQLFilter[] = [];

  if (cohort1Filters) {
    cohort1Content.push(cohort1Filters);
  }

  if (cohort2Filters) {
    cohort2Content.push(cohort2Filters);
  }

  return {
    cohort1: {
      and: cohort1Content,
    },
    cohort2: {
      and: cohort2Content,
    },
  };
};

export default makeIntersectionFilters;
