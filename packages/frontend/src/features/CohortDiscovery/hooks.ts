import { AppState, useAppDispatch, useAppSelector } from './appApi';

import {
  selectAllFiltersCollapsed,
  selectFilterExpanded,
  toggleCategoryFilter,
} from './FilterExpandSlice';
import { selectSelectedFacetsFromIndex } from './SelectedFacetsSlice';
import {
  removeCohortFilter,
  updateCohortFilter,
} from './CohortManagment/CohortManagerSlice';
import {
  selectCurrentCohortIndexFilters,
  selectCurrentCohortFilters,
} from './CohortManagment/CohortManagerSelectors';
import { FilterSet, Operation } from '@gen3/core';
import { buildNested } from '../../components/facets';

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

export const useCohortFacetFilters = (index: string): FilterSet => {
  return useAppSelector(
    (state: AppState) => selectCurrentCohortFilters(state)[index],
  );
};

export const useClearFilters = (index: string) => {
  const dispatch = useAppDispatch();

  return (field: string) => {
    dispatch(removeCohortFilter({ index, field }));
  };
};

export const useGetSelectFacets = (state: AppState, index: string) => {
  return selectSelectedFacetsFromIndex(state, index);
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
    selectCurrentCohortIndexFilters(index, field) ?? {
      operator: 'and',
      operands: [],
    },
  );
};
