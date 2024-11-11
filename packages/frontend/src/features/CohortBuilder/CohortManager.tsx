import {
  useCoreSelector,
  selectCurrentCohortId,
  selectCurrentCohortName,
  CoreState,
  useCoreDispatch,
  clearCohortFilters,
  removeCohortFilter,
  Operation,
  updateCohortFilter,
  FilterSet,
  setCohortFilter,
} from '@gen3/core';

import { useCohortFacetFilters } from './hooks';
import QueryExpressionSection from './QueryExpressionSection';
import { QueryExpressionContext } from './QueryExpressionContext';

interface CohortManagerProps {
  index: string;
}

const CohortManager = ({ index }: CohortManagerProps) => {
  const currentCohortId = useCoreSelector((state: CoreState) =>
    selectCurrentCohortId(state),
  );
  const currentCohortName = useCoreSelector((state: CoreState) =>
    selectCurrentCohortName(state),
  );
  const filters = useCohortFacetFilters(index);

  return (
    <div className="flex flex-col mb-2">
      <QueryExpressionContext.Provider
        value={{
          cohortName: currentCohortName,
          cohortId: currentCohortId,
          filters: filters,
          displayOnly: false,
          useClearCohortFilters: () => {
            const dispatch = useCoreDispatch();
            return (index: string) => dispatch(clearCohortFilters({ index }));
          },
          useRemoveFilter: () => {
            const dispatch = useCoreDispatch();
            return (index: string, field: string) =>
              dispatch(
                removeCohortFilter({
                  index: index,
                  field: field,
                }),
              );
          },
          useUpdateFilters: () => {
            const dispatch = useCoreDispatch();
            return (index: string, field: string, filter: Operation) =>
              dispatch(
                updateCohortFilter({
                  index,
                  field: field,
                  filter: filter,
                }),
              );
          },
          useSetCohortFilters: () => {
            const dispatch = useCoreDispatch();
            return (index: string, filters: FilterSet) =>
              dispatch(
                setCohortFilter({
                  index,
                  filters: filters,
                }),
              );
          },
        }}
      >
        <QueryExpressionSection index={index} />
      </QueryExpressionContext.Provider>
    </div>
  );
};

export default CohortManager;
