import React from 'react';
import { FilterSet, Operation } from '@gen3/core';
import { useCohortFacetFilters } from './hooks';
import {
  QueryExpressionContext,
  QueryExpressionSection,
} from '../CohortBuilder';
import { useAppSelector, AppState, useAppDispatch } from './appApi';
import {
  clearCohortFilters,
  removeCohortFilter,
  updateCohortFilter,
  setCohortFilter,
  selectCurrentCohortId,
  selectCurrentCohortName,
} from './SavedCohortManagerSlice';

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

  return (
    <div className="flex flex-col mb-2">
      <QueryExpressionContext.Provider
        value={{
          cohortName: currentCohortName,
          cohortId: currentCohortId,
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
          useGetFilters: useCohortFacetFilters,
        }}
      >
        <QueryExpressionSection index={index} />
      </QueryExpressionContext.Provider>
    </div>
  );
};

export default CohortManager;
