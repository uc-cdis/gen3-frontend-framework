import React from 'react';
import {
  clearCohortFilters,
  FilterSet,
  Operation,
  removeCohortFilter,
  setCohortFilter,
  updateCohortFilter,
  useCoreDispatch,
} from '@gen3/core';

export const QueryExpressionContext = React.createContext<{
  displayOnly: boolean;
  filters: FilterSet;
  cohortName: string;
  cohortId: string;
  useClearCohortFilters: () => (index: string) => void;
  useUpdateFilters: () => (
    index: string,
    field: string,
    filter: Operation,
  ) => void;
  useRemoveFilter: () => (index: string, field: string) => void;
  useSetCohortFilters: () => (index: string, filters: FilterSet) => void;
}>({
  displayOnly: false,
  cohortId: 'default',
  cohortName: 'default',
  filters: { mode: 'and', root: {} } as FilterSet,
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
});
