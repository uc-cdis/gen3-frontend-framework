import {
  createSelector,
  createEntityAdapter,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import { IndexedFilterSet } from '@gen3/core';
import { AppState } from './appApi';
import {
  Cohort,
  CohortId,
  DataAccessRequestUserInformation,
  newCohort,
  newDataAccessRequest,
} from './types';

// Create the entity adapter
export const cohortsAdapter = createEntityAdapter<Cohort, CohortId>({
  // Select the id as the primary key
  selectId: (cohort: Cohort) => cohort.id,
  // Optional: Sort by name if needed
  sortComparer: (a, b) => {
    if (a.modifiedDatetime <= b.modifiedDatetime) return 1;
    else return -1;
  },
});

type SavedCohortState = EntityState<Cohort, CohortId>;

interface AddCohortParams {
  name: string;
  filters: IndexedFilterSet;
}

// Create a slice with reducers
export const cohortPersistenceSlice = createSlice({
  name: 'CohortDiscovery/CohortManager',
  initialState: cohortsAdapter.getInitialState(),
  reducers: {
    // Add a single cohort
    saveCohort: (state, action: PayloadAction<AddCohortParams>) => {
      const cohort = newCohort(action.payload.name, action.payload.filters);
      cohortsAdapter.setOne(state, cohort);
    },
    // Remove a cohort
    removeCohort: cohortsAdapter.removeOne,
    // Remove multiple cohorts
    removeCohorts: cohortsAdapter.removeMany,
  },
});

// Export actions
export const { saveCohort, removeCohort, removeCohorts } =
  cohortPersistenceSlice.actions;

// Export selectors
export const {
  selectAll: selectAllCohorts,
  selectTotal: selectTotalCohorts,
  selectById: selectCohortById,
} = cohortsAdapter.getSelectors((state: AppState) => state.savedCohorts);

export const selectCohortIdToNameMap = createSelector(
  [selectAllCohorts],
  (cohorts) => {
    return cohorts.reduce<Record<CohortId, string>>((acc, cohort) => {
      acc[cohort.id] = cohort.name;
      return acc;
    }, {});
  },
);

// Export reducer
export const cohortPersistenceReducer = cohortPersistenceSlice.reducer;
