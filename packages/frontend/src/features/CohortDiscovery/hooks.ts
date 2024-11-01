import { AppState, useAppDispatch, useAppSelector } from './appApi';

import {
  selectAllFiltersCollapsed,
  selectFilterExpanded,
  toggleCategoryFilter,
} from './FilterExpandSlice';
import { removeCohortFilter, updateCohortFilter } from './CohortSlice';
import { Operation } from '@gen3/core';
import { buildNested } from '../../components/facets';
import { selectIndexedFilterByName } from './CohortSelectors';

export const useToggleExpandFilter = () => {
  const dispatch = useAppDispatch();
  return (field: string, expanded: boolean) => {
    dispatch(toggleCategoryFilter({ field, expanded }));
  };
};

export const useFilterExpandedState = (field: string) => {
  return useAppSelector((state: AppState) =>
    selectFilterExpanded(state, field),
  );
};

export const useAllFiltersCollapsed = () => {
  return useAppSelector((state: AppState) => selectAllFiltersCollapsed(state));
};
export const useClearFilters = (index: string) => {
  const dispatch = useAppDispatch();

  return (field: string) => {
    dispatch(removeCohortFilter({ index, field }));
  };
};
/**
 * Update Guppy filters: process nested fields and have the final
 * leaf be filtered
 * @param index
 */
export const useUpdateFilters = (index: string) => {
  const dispatch = useAppDispatch();
  // update the filter for this facet

  return (field: string, filter: Operation) => {
    dispatch(
      updateCohortFilter({
        index: index,
        field: field,
        filter: buildNested(field, filter),
      }),
    );
  };
};
export const useGetFacetFilters = (index: string, field: string): Operation => {
  return useAppSelector(
    (state: AppState) =>
      selectIndexedFilterByName(state, index, field) ?? {
        operator: 'and',
        operands: [],
      },
  );
};
