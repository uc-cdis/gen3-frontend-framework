import React from 'react';
import {
  clearCohortFilters,
  CoreState,
  FilterSet,
  Operation,
  removeCohortFilter,
  selectCurrentCohortId,
  selectCurrentCohortName,
  selectSharedFilters,
  selectShouldShareFilters,
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

  return (
    <QueryExpressionContext.Provider
      value={{
        cohortName: currentCohortName,
        cohortId: currentCohortId,
        displayOnly: false,
        useClearCohortFilters: () => {
          const dispatch = useCoreDispatch();
          const shouldShareFilters = useCoreSelector((state) =>
            selectShouldShareFilters(state),
          );
          const sharedFilters = useCoreSelector((state) =>
            selectSharedFilters(state),
          );

          const filters = useCohortFacetFilters(index);

          return (index: string) => {
            if (shouldShareFilters) {
              // get all filters on this index
              // remove them from all other indexes
              // clear this index
              const fields = Object.keys(filters.root);
              fields.forEach((field) => {
                sharedFilters[field].forEach((x) => {
                  dispatch(
                    removeCohortFilter({ index: x.index, field: x.field }),
                  );
                });
              });
            } else dispatch(clearCohortFilters({ index }));
          };
        },
        useRemoveFilter: () => {
          const dispatch = useCoreDispatch();
          const shouldShareFilters = useCoreSelector((state) =>
            selectShouldShareFilters(state),
          );
          const sharedFilters = useCoreSelector((state) =>
            selectSharedFilters(state),
          );

          return (index: string, field: string) => {
            if (shouldShareFilters && field in sharedFilters) {
              sharedFilters[field].forEach((x) => {
                dispatch(
                  removeCohortFilter({
                    index: x.index,
                    field: field,
                  }),
                );
              });
            } else
              dispatch(
                removeCohortFilter({
                  index: index,
                  field: field,
                }),
              );
          };
        },
        useUpdateFilters: () => {
          const dispatch = useCoreDispatch();
          const shouldShareFilters = useCoreSelector((state) =>
            selectShouldShareFilters(state),
          );
          const sharedFilters = useCoreSelector((state) =>
            selectSharedFilters(state),
          );

          return (index: string, field: string, filter: Operation) => {
            if (shouldShareFilters && field in sharedFilters) {
              sharedFilters[field].forEach((x) => {
                dispatch(
                  updateCohortFilter({
                    index: x.index,
                    field: field,
                    filter: filter,
                  }),
                );
              });
            } else
              dispatch(
                updateCohortFilter({
                  index,
                  field: field,
                  filter: filter,
                }),
              );
          };
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
        useGetFilters: useCohortFacetFilters,
      }}
    >
      <QueryExpressionSection index={index} />
    </QueryExpressionContext.Provider>
  );
};

export default QueryExpression;
