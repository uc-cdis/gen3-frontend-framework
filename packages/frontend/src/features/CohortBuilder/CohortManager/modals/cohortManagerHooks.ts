import {
  useSavePersistedCohort,
  useGetPersistedCohortById,
  useGetAllPersistedCohorts,
  useDeletePersistedCohort,
  useUpdatePersistedCohort,
} from '@gen3/core';

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
  useSaveCohort: useSavePersistedCohort,
};
