import { useCoreSelector, FilterSet, selectCohortFilters } from '@gen3/core';

export const useCohortFacetFilters = (index:string): FilterSet => {
  return useCoreSelector((state) => selectCohortFilters(state)[index]);
};
