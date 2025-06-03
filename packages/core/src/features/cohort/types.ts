import { IndexedFilterSet } from '../filters';

export type CombineMode = 'and' | 'or';

export type CohortId = string;

/**
 * A Cohort is a collection of filters that can be used to query the GDC API.
 * The cohort interface is used to manage the cohort state in the redux-toolkit entity adapter.
 * @see https://redux-toolkit.js.org/api/createEntityAdapter
 *
 * @property id - the id of the cohort
 * @property name - the name of the cohort
 * @property filters - the filters for the cohort
 * @property modified - flag indicating if the cohort has been modified
 * @property modified_datetime - the last time the cohort was modified
 * @property saved - flag indicating if the cohort has been saved
 * @category Cohort
 */
export interface Cohort {
  id: CohortId;
  name: string;
  filters: IndexedFilterSet; // maps of index to filter set
  modified?: boolean; // flag which is set to true if modified and unsaved
  modified_datetime: string; // last time cohort was modified
  saved?: boolean; // flag indicating if cohort has been saved.
}

export interface CohortPersistenceSaveUpdateParameters {
  newName: string;
  cohortId: string;
  filters: IndexedFilterSet;
  caseFilters?: any;
  createStaticCohort: boolean;
  saveAs: boolean;
}
