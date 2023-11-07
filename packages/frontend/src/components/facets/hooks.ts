import {
  type EnumFilterValue,
  useCoreDispatch,
  removeCohortFilter,
  useCoreSelector,
  selectIndexedFilterByName,
  extractEnumFilterValue,
  CoreState,
} from '@gen3/core';

import { FromToRange } from './types';
import { extractRangeValues } from './utils';

// Core ClearFilters hook
export const useClearFilters = (index: string) => {
  const dispatch = useCoreDispatch();

  return (field: string) => {
    dispatch(removeCohortFilter({ index, field }));
  };
};

/**
 * Selector for the facet values (if any) from the current cohort
 * @param field - field name to find filter for
 * @return Value of Filters or undefined
 */
export const useExtractEnumFilterValues = (
  index: string,
  field: string,
): EnumFilterValue => {
  const filter = useCoreSelector((state : CoreState) =>
    selectIndexedFilterByName(state, index, field),
  );
  return filter ? extractEnumFilterValue(filter) :  [];
};


export const useExtractRangeFilterValues = (
  index: string,
  field: string,
): FromToRange<string | number> | undefined => {
  const filter  = useCoreSelector((state : CoreState) =>
    selectIndexedFilterByName(state, index, field),
  );
  return filter ? extractRangeValues(filter) : undefined;
};
