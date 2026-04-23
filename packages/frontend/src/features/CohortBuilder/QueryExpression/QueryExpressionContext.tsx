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

export interface QueryExpressionHooks {
  useClearCohortFilters: () => (index: string) => void;
  useUpdateFilters: () => (
    index: string,
    field: string,
    filter: Operation,
  ) => void;
  useRemoveFilter: () => (index: string, field: string) => void;
  useSetCohortFilters: () => (index: string, filters: FilterSet) => void;
  useGetFilters: (index: string) => FilterSet;
  useFormatFilters: () => (value: string, field: string) => Promise<string>;
}

export interface QueryExpressionContextProps extends QueryExpressionHooks {
  displayOnly: boolean;
  cohortName: string;
  cohortId: string | null;
  fieldsAreFlat: boolean;
  shouldShowSummary?: (field: string, count: number) => boolean;
}

export const QueryExpressionContext =
  React.createContext<QueryExpressionContextProps>({
    displayOnly: false,
    fieldsAreFlat: true,
    cohortId: null,
    cohortName: 'default',
    shouldShowSummary: () => false,
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
    useGetFilters: () => {
      return { mode: 'and', root: {} } as FilterSet;
    },
    useFormatFilters: () => (value: string, _field: string) =>
      Promise.resolve(value),
  });
