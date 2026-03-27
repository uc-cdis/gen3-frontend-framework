import React from 'react';
import { FilterSet, Operation } from '@gen3/core';
import { useCohortFacetFilters } from './hooks';
import { QueryExpressionContext, QueryExpressionSection, } from '../CohortBuilder';
import { AppState, useAppDispatch, useAppSelector } from './appApi';
import {
  clearCohortFilters,
  removeCohortFilter,
  setCohortFilter,
  updateCohortFilter,
} from './CohortManagment/CohortManagerSlice';

import { selectCurrentCohortId, selectCurrentCohortName, } from './CohortManagment/CohortManagerSelectors';

interface CohortManagerProps {
  index: string;
  fieldsAreFlat?: boolean;
}

const CohortQueryExpression = ({
  index,
  fieldsAreFlat = true,
}: CohortManagerProps) => {
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
          fieldsAreFlat: true,
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
          useFormatFilters: () => (value: string, _field: string) =>
            Promise.resolve(value),
        }}
      >
        <QueryExpressionSection index={index} />
      </QueryExpressionContext.Provider>
    </div>
  );
};

export default CohortQueryExpression;
