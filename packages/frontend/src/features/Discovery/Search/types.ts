export type SearchFilterState = Record<string, Record<string, boolean>>;
export enum SearchCombination {
  and = 'AND',
  or = 'OR',
}

export interface AdvancedSearchTerms {
  operation: SearchCombination;
  filters: SearchFilterState;
}

export type SetAdvancedSearchFiltersFn = ( params: AdvancedSearchTerms ) => void;
