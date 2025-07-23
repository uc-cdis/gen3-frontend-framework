import { EntityState } from '@reduxjs/toolkit';
import {
  autoSaveCohort,
  CohortManagerState,
  createDefaultCohort,
} from './CohortManagerSlice';
import { Cohort, CohortId } from '../types';

const getCurrentCohort = (
  state: EntityState<Cohort, CohortId> & CohortManagerState,
): Cohort => {
  const cohort = state.entities[state.currentCohortId];
  if (!cohort) {
    console.log('creating default cohort');
    return createDefaultCohort();
  }
  return cohort;
};

export const autoSaveMiddleware =
  (store: any) => (next: any) => (action: any) => {
    const result = next(action);

    const autoSaveActions = [
      'updateCohortName',
      'updateCohortFilter',
      'setCohortFilter',
      'setAllIndexFilters',
      'removeCohortFilter',
      'clearCohortFilters',
    ];

    if (
      autoSaveActions.some((actionType) => action.type.includes(actionType))
    ) {
      const state = store.getState();
      const currentCohort = getCurrentCohort(state.cohorts);

      if (
        currentCohort.saved &&
        !state.cohorts.autoSaveInProgress.has(currentCohort.id)
      ) {
        setTimeout(() => {
          const updatedState = store.getState();
          const updatedCohort = getCurrentCohort(updatedState.cohorts);

          if (
            updatedCohort.saved &&
            !updatedState.cohorts.autoSaveInProgress.has(updatedCohort.id)
          ) {
            store.dispatch(autoSaveCohort(updatedCohort.id));
          }
        }, 1000);
      }
    }

    return result;
  };
