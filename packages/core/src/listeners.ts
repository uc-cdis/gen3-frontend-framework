import type { PayloadAction, TypedStartListening } from '@reduxjs/toolkit';
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { CoreDispatch } from './store';
import { CoreState } from './reducers';
import { CountsData } from './features/cohort/types';

import {
  clearCohortFilters,
  removeCohortFilter,
  updateCohortCounts,
  updateCohortFilter,
} from './features/cohort/cohortManagerSlice';

import { selectCurrentCohortId } from './features/cohort/cohortManagerSelector';
import { explorerApi } from './features/guppy/guppySlice';

const isPayloadActionWithObject = (
  action: unknown,
): action is PayloadAction<Record<string, unknown>> => {
  return (
    typeof action === 'object' &&
    action !== null &&
    'type' in action &&
    'payload' in action &&
    typeof action.payload === 'object'
  );
};

/**
 * Defines coreListeners for adding middleware.
 * used to update the current Cohort Case count
 */

export const coreStoreListenerMiddleware = createListenerMiddleware();
export type CoreStartListening = TypedStartListening<CoreState, CoreDispatch>;

export const startCoreListening =
  coreStoreListenerMiddleware.startListening as CoreStartListening;

startCoreListening({
  matcher: isAnyOf(updateCohortFilter, removeCohortFilter, clearCohortFilters),
  effect: async (_, listenerApi) => {
    const currentCohortId = selectCurrentCohortId(listenerApi.getState());
    // need to pass the current cohort id to the case count fetcher because it is possible that
    // the current cohort will be different when the fetch is fulfilled
    if (currentCohortId) console.log('currentCohortId', currentCohortId);
  },
});

startCoreListening({
  matcher: isAnyOf(explorerApi.endpoints.getAggs.matchFulfilled),
  effect: async (action, listenerApi) => {
    if (isPayloadActionWithObject(action)) {
      const root: any = action.payload;
      const counts = root?._totalCount.reduce((acc: CountsData, curr: any) => {
        const { key, count } = curr;
        acc[key] = count;
        return acc;
      }, {});

      if (counts) {
        listenerApi.dispatch(updateCohortCounts(counts ?? {}));
      }
    }
  },
});

startCoreListening({
  matcher: isAnyOf(explorerApi.endpoints.getCounts.matchFulfilled),
  effect: async (
    action: PayloadAction<number, string, Record<any, any>>,
    listenerApi,
  ) => {
    const counts = action.payload;
    const index = action?.meta?.arg?.originalArgs?.index;
    if (index) listenerApi.dispatch(updateCohortCounts({ [index]: counts }));
  },
});
