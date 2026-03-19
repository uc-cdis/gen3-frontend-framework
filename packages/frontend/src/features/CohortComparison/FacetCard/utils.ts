import { FilterSet } from '@gen3/core';

export const formatBucket = (bucket: [number, number] | string): string => {
  return bucket === '_missing' ? 'missing' : (bucket as string);
};

export const createFilters = (
  field: string,
  bucket: string | [number, number],
): FilterSet => {
  if (bucket === '_missing') {
    return {
      mode: 'and',
      root: {
        [field]: {
          field,
          operator: 'missing',
        },
      },
    } as FilterSet;
  }

  return {
    mode: 'and',
    root: {
      [field]: {
        field: field,
        operands: [bucket],
        operator: 'includes',
      },
    },
  } as FilterSet;
};
