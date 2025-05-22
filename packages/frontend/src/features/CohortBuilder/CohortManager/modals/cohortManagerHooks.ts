import type { CohortHooks } from '../types';
import {
  useSelectAvailableCohorts,
  useSelectCurrentCohort,
  useAddUnsavedCohort,
  useSetActiveCohort,
  useDeleteCohort,
} from './cohortActionHooks';

const hooks: CohortHooks = {
  useSelectAvailableCohorts,
  useSelectCurrentCohort,
  useAddUnsavedCohort,
  useSetActiveCohort,
  useDeleteCohort,
};
