import { useCallback } from 'react';
import {
  CoreState,
  type EnumFilterValue,
  extractEnumFilterValue,
  fieldNameToTitle,
  removeCohortFilter,
  selectIndexedFilterByName,
  selectSharedFilters,
  selectShouldShareFilters,
  useCoreDispatch,
  useCoreSelector,
} from '@gen3/core';

import { FromToRange } from './types';
import { extractRangeValues } from './utils';

// Core ClearFilters hook
export const useClearFilters = (index: string) => {
  const dispatch = useCoreDispatch();

  const shouldShareFilters = useCoreSelector((state) =>
    selectShouldShareFilters(state),
  );
  const sharedFilters = useCoreSelector((state) => selectSharedFilters(state));

  return (field: string) => {
    if (shouldShareFilters && field in sharedFilters) {
      sharedFilters[field].forEach((x) => {
        dispatch(removeCohortFilter({ index: x.index, field: x.field }));
      });
    } else dispatch(removeCohortFilter({ index, field }));
  };
};

/**
 * Selector for the facet values (if any) from the current cohort
 * @param index - index of filter
 * @param field - field name to find filter for
 * @return Value of Filters or undefined
 */
export const useExtractEnumFilterValues = (
  index: string,
  field: string,
): EnumFilterValue => {
  const filter = useCoreSelector((state: CoreState) =>
    selectIndexedFilterByName(state, index, field),
  );
  return filter ? extractEnumFilterValue(filter) : [];
};

export const useExtractRangeFilterValues = (
  index: string,
  field: string,
): FromToRange<string | number> | undefined => {
  const filter = useCoreSelector((state: CoreState) =>
    selectIndexedFilterByName(state, index, field),
  );
  return filter ? extractRangeValues(filter) : undefined;
};

export const useFieldNameToTitle = () => {
  const fieldToTitle = useCallback((field: string, sections?: number) => {
    return field === 'genes.gene_id'
      ? 'Mutated Gene'
      : fieldNameToTitle(field, sections);
  }, []);

  return fieldToTitle;
};
