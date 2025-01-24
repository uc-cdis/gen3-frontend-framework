import {
  useCoreDispatch,
  CoreState,
  useCoreSelector,
  FilterSet,
  selectCohortFilters,
  toggleCohortBuilderCategoryFilter,
  selectAllCohortFiltersCollapsed,
  selectCohortFilterExpanded,
} from '@gen3/core';

export const useCohortFacetFilters = (index: string): FilterSet => {
  return useCoreSelector((state) => selectCohortFilters(state)[index]);
};

export const useToggleExpandFilter = (index: string) => {
  const dispatch = useCoreDispatch();
  return (field: string, expanded: boolean) => {
    dispatch(toggleCohortBuilderCategoryFilter({ index, field, expanded }));
  };
};

export const useFilterExpandedState = (index: string, field: string) => {
  return useCoreSelector((state: CoreState) =>
    selectCohortFilterExpanded(state, index, field),
  );
};

export const useAllFiltersCollapsed = (index: string) => {
  return useCoreSelector((state: CoreState) =>
    selectAllCohortFiltersCollapsed(state, index),
  );
};
