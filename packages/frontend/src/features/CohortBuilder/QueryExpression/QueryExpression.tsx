import {
  clearCohortFilters,
  CoreState,
  FilterSet,
  Operation,
  removeCohortFilter,
  selectCurrentCohortId,
  selectCurrentCohortName,
  setCohortFilter,
  updateCohortFilter,
  useCoreDispatch,
  useCoreSelector,
} from '@gen3/core';
import QueryExpressionSection from './QueryExpressionSection';
import { QueryExpressionContext } from './QueryExpressionContext';
import { useCohortFacetFilters } from '../hooks';

interface QueryExpressionProps {
  index: string;
}

const QueryExpression = ({ index }: QueryExpressionProps) => {
  const currentCohortId = useCoreSelector((state: CoreState) =>
    selectCurrentCohortId(state),
  );
  const currentCohortName = useCoreSelector((state: CoreState) =>
    selectCurrentCohortName(state),
  );

  const filters = useCohortFacetFilters(index);

  return (
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
  );
};

export default QueryExpression;
