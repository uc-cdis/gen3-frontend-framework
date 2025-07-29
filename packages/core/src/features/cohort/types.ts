import { IndexedFilterSet } from '../filters';

export type CombineMode = 'and' | 'or';

export type CohortId = string;

export type CountsData = Record<string, number>;

export interface StorageEntity<T> {
  id: T;
  name: string;
}

/**
 * A Cohort is a collection of filters that can be used to query the GDC API.
 * The cohort interface is used to manage the cohort state in the redux-toolkit entity adapter.
 * @see https://redux-toolkit.js.org/api/createEntityAdapter
 *
 * @property id - the id of the cohort
 * @property name - the name of the cohort
 * @property filters - the filters for the cohort
 * @property modified - flag indicating if the cohort has been modified
 * @property modifiedDatetime - the last time the cohort was modified
 * @property saved - flag indicating if the cohort has been saved
 * @category Cohort
 */
export interface Cohort extends StorageEntity<CohortId> {
  filters: IndexedFilterSet; // maps of index to filter set
  modified?: boolean; // flag which is set to true if modified and unsaved
  createdDatetime: string; //  time cohort was created
  modifiedDatetime: string; // last time cohort was modified
  saved?: boolean; // flag indicating if cohort has been saved.
  counts?: CountsData; // counts for each index "unit" (e.g. case or study) in the cohort
}
