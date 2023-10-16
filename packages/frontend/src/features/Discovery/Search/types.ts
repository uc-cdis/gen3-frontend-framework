export type SearchFilterState = Record<string, Record<string, boolean>>;
export enum SearchCombination {
  and = 'AND',
  or = 'OR',
}

export interface AdvancedSearchTerms {
  operation: SearchCombination;
  filters: SearchFilterState;
}

export enum AccessSortDirection {
  ASCENDING = 'sort ascending',
  DESCENDING = 'sort descending',
  NONE = 'cancel sorting',
}

export type SetAdvancedSearchFiltersFn = (params: AdvancedSearchTerms) => void;

export interface SearchInputProps {
  searchChanged: (searchTerm: string) => void;
  clearSearch?: () => void;
  placeholder?: string;
  label?: string;
}
