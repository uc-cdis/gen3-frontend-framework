import {
  useCoreDispatch,
  CoreState,
  useCoreSelector,
  FilterSet,
  selectCohortFilters,
  toggleCohortBuilderCategoryFilter,
} from '@gen3/core';

export const useCohortFacetFilters = (index: string): FilterSet => {
  return useCoreSelector((state) => selectCohortFilters(state)[index]);
};

export const useToggleExpandFilter = () => {
  const dispatch = useCoreDispatch();
  return (field: string, expanded: boolean) => {
    dispatch(toggleCohortBuilderCategoryFilter({ field, expanded }));
  };
};

export const useFilterExpandedState = (field: string) => {
  return useCoreSelector((state: CoreState) =>
    selectFilterExpanded(state, field),
  );
};

export const useAllFiltersCollapsed = () => {
  return useCoreSelector((state: CoreState) =>
    selectAllFiltersCollapsed(state),
  );
};
