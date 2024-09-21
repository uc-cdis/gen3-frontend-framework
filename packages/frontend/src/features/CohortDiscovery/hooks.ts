import { AppState, useAppDispatch, useAppSelector } from './appApi';

import {
  selectFilterExpanded,
  selectAllFiltersCollapsed,
  toggleCategoryFilter,
} from './FilterExpandSlice';

export const useToggleExpandFilter = () => {
  const dispatch = useAppDispatch();
  return (field: string, expanded: boolean) => {
    dispatch(toggleCategoryFilter({ field, expanded }));
  };
};

export const useFilterExpandedState = (field: string) => {
  return useAppSelector((state: AppState) =>
    selectFilterExpanded(state, field),
  );
};

export const useAllFiltersCollapsed = () => {
  return useAppSelector((state: AppState) => selectAllFiltersCollapsed(state));
};
