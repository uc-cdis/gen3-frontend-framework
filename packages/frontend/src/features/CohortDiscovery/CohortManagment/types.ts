import { FilterSet, StorageOperationResults } from '@gen3/core';
import { Cohort, CohortId } from '../types';

export interface CohortStorageReturnStatus<
  T = Cohort | Record<CohortId, Cohort> | number | boolean,
> extends StorageOperationResults {
  data?: T;
}

export const EmptyFilterSet: FilterSet = { mode: 'and', root: {} };
