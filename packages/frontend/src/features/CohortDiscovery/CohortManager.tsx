import { FilterSet, Operation } from '@gen3/core';
import { useCohortFacetFilters } from './hooks';
import QueryExpressionSection from '../CohortBuilder/QueryExpressionSection';
import { QueryExpressionContext } from '../CohortBuilder/QueryExpressionContext';
import { useAppSelector, AppState, useAppDispatch } from './appApi';
import {
  selectCurrentCohortId,
  selectCurrentCohortName,
} from './CohortSelectors';
import {
  clearCohortFilters,
  removeCohortFilter,
  updateCohortFilter,
  setCohortFilter,
} from './CohortSlice';

interface CohortManagerProps {
  index: string;
}

const CohortManager = ({ index }: CohortManagerProps) => {
  const currentCohortId = useAppSelector((state: AppState) =>
    selectCurrentCohortId(state),
  );
  const currentCohortName = useAppSelector((state: AppState) =>
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
            const dispatch = useAppDispatch();
            return (index: string) => dispatch(clearCohortFilters({ index }));
          },
          useRemoveFilter: () => {
            const dispatch = useAppDispatch();
            return (index: string, field: string) =>
              dispatch(
                removeCohortFilter({
                  index: index,
                  field: field,
                }),
              );
          },
          useUpdateFilters: () => {
            const dispatch = useAppDispatch();
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
            const dispatch = useAppDispatch();
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
