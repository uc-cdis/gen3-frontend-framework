import type { PayloadAction, TypedStartListening } from '@reduxjs/toolkit';
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { CoreDispatch } from './store';
import { CoreState } from './reducers';

import { updateCohortIndexCountById } from './features/cohort/cohortManagerSlice';

import { explorerApi } from './features/guppy/guppySlice';

/**
 * Defines coreListeners for adding middleware.
 * used to update the current Cohort Case count
 */

export const coreStoreListenerMiddleware = createListenerMiddleware();
export type CoreStartListening = TypedStartListening<CoreState, CoreDispatch>;

export const startCoreListening =
  coreStoreListenerMiddleware.startListening as CoreStartListening;

/**
 * When a getCounts is requested, it might be for a cohort.
 * If so, then update the cohort's counts for that index
 */
startCoreListening({
  matcher: isAnyOf(explorerApi.endpoints.getCounts.matchFulfilled),
  effect: async (
    action: PayloadAction<number, string, Record<any, any>>,
    listenerApi,
  ) => {
    const counts = action.payload;
    const index = action?.meta?.arg?.originalArgs?.type; // note this is the guppy index name
    const cohortId = action?.meta?.arg?.originalArgs?.queryId;
    if (cohortId && index) {
      listenerApi.dispatch(
        updateCohortIndexCountById({ index, cohortId, counts }),
      );
    }
  },
});
