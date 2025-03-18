import {
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
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

type SavedCohortState = EntityState<Cohort, CohortId>;

interface AddCohortParams {
  name: string;
  filters: IndexedFilterSet;
}

interface DataAccessRequestForCohort {
  cohortId: CohortId;
  userAccessInformation: DataAccessRequestUserInformation;
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
    requestCohortDataAccess: (
      state,
      action: PayloadAction<DataAccessRequestForCohort>,
    ) => {
      const { cohortId, userAccessInformation } = action.payload;
      const cohort = state.entities[cohortId];
      if (!cohort) return;

      const updatedCohort = {
        ...cohort,
        dataAccessRequests: newDataAccessRequest(userAccessInformation, cohort),
      };

      cohortsAdapter.setOne(state, updatedCohort);
    },

    // Remove a cohort
    removeCohort: cohortsAdapter.removeOne,
    // Remove multiple cohorts
    removeCohorts: cohortsAdapter.removeMany,
    // Set the selected cohort
  },
});

// Export actions
export const {
  saveCohort,
  removeCohort,
  removeCohorts,
  requestCohortDataAccess,
} = cohortPersistenceSlice.actions;

// Export selectors
export const {
  selectAll: selectAllCohorts,
  selectTotal: selectTotalCohorts,
  selectById: selectCohortById,
} = cohortsAdapter.getSelectors((state: AppState) => state.savedCohorts);

// Export reducer
export const cohortPersistenceReducer = cohortPersistenceSlice.reducer;
