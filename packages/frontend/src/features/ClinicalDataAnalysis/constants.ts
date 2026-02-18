import { FacetType } from '@gen3/core';

export const CONTINUOUS_FACET_TYPES: Array<FacetType> = [
  'year',
  'years',
  'age',
  'range',
  'numeric_range',
  'percent',
];

export const SPECIAL_CASE_FIELDS: Record<string, string> = {
  // TODO - remove special case when field is updated
  gender: 'Sex',
};

export const SURVIVAL_PLOT_MIN_COUNT = 10;
export const BUCKETS_MAX_COUNT = 500;
export const MISSING_KEY = '_missing';
