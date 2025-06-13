import {
  createSelector,
  createEntityAdapter,
  createSlice,
  PayloadAction,
  EntityState,
} from '@reduxjs/toolkit';
import { FilterSet, IndexedFilterSet, Operation } from '@gen3/core';
import { AppState } from './appApi';
import { Cohort, CohortId, newCohort } from './types';

const EmptyFilterSet: FilterSet = { mode: 'and', root: {} };

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

export interface SavedCohortsState {
  currentCohortId: string;
}

const DEFAULT_COHORT_ID = 'default';
const DEFAULT_COHORT_NAME = 'Default';

const DefaultCohort = newCohort(DEFAULT_COHORT_NAME, {}, DEFAULT_COHORT_ID);

const emptyInitialState = cohortsAdapter.getInitialState<SavedCohortsState>({
  currentCohortId: DEFAULT_COHORT_ID,
});

const initialState = cohortsAdapter.addOne(emptyInitialState, DefaultCohort);

interface AddCohortParams {
  name: string;
  filters: IndexedFilterSet;
}

interface UpdateFilterParams {
  index: string;
  field: string;
  filter: Operation;
}

interface SetFilterParams {
  index: string;
  filters: FilterSet;
}

interface RemoveFilterParams {
  index: string;
  field: string;
}

interface ClearAllFilterParams {
  index: string;
}

// Create a slice with reducers
export const cohortPersistenceSlice = createSlice({
  name: 'CohortDiscovery/CohortManager',
  initialState: initialState,
  reducers: {
    resetCurrentCohortId: (state) => {
      state.currentCohortId = DEFAULT_COHORT_ID;
    },
    setCurrentCohortId: (state, action: PayloadAction<string>) => {
      state.currentCohortId = action.payload;
    },
    // Add a single cohort
    saveCohort: (state, action: PayloadAction<AddCohortParams>) => {
      const cohort = newCohort(
        action.payload.name,
        action.payload.filters,
        undefined,
        true,
      );
      cohortsAdapter.setOne(state, cohort);
    },
    // Remove a cohort
    removeSavedCohort: (state, action: PayloadAction<string>) => {
      // do not remove the default cohort
      if (action.payload === DEFAULT_COHORT_ID) {
        return;
      }
      cohortsAdapter.removeOne(state, action.payload);
      state.currentCohortId = DEFAULT_COHORT_ID;
    },
    // Remove multiple cohorts
    removeAllSavedCohorts: (state) => {
      cohortsAdapter.removeMany(state, Object.keys(state.entities));
      cohortsAdapter.addOne(state, DefaultCohort);
      state.currentCohortId = DEFAULT_COHORT_ID;
    },
    updateCohortFilter: (state, action: PayloadAction<UpdateFilterParams>) => {
      const { index, field, filter } = action.payload;
      const currentCohort = getCurrentCohort(state);
      cohortsAdapter.updateOne(state, {
        id: currentCohort.id,
        changes: {
          filters: {
            ...currentCohort.filters,
            [index]: {
              mode: currentCohort.filters?.[index]?.mode ?? 'and',
              root: {
                ...(currentCohort.filters?.[index]?.root ?? {}),
                [field]: filter,
              },
            },
          },
          modified: true,
          modifiedDatetime: new Date().toISOString(),
        },
      });
    },
    setCohortFilter: (state, action: PayloadAction<SetFilterParams>) => {
      const { index, filters } = action.payload;
      const currentCohort = getCurrentCohort(state);
      cohortsAdapter.updateOne(state, {
        id: currentCohort.id,
        changes: {
          filters: {
            ...currentCohort.filters,
            [index]: filters,
          },
          modified: true,
          modifiedDatetime: new Date().toISOString(),
        },
      });
    },
    setAllIndexFilters: (state, action: PayloadAction<IndexedFilterSet>) => {
      const currentCohort = getCurrentCohort(state);
      cohortsAdapter.updateOne(state, {
        id: currentCohort.id,
        changes: {
          filters: action.payload,
          modified: true,
          modifiedDatetime: new Date().toISOString(),
        },
      });
    },
    removeCohortFilter: (state, action: PayloadAction<RemoveFilterParams>) => {
      const { index, field } = action.payload;
      const currentCohort = getCurrentCohort(state);
      const filters = currentCohort.filters?.[index]?.root;
      if (!filters) {
        return;
      }
      const { [field]: _a, ...updated } = filters;
      cohortsAdapter.updateOne(state, {
        id: currentCohort.id,
        changes: {
          filters: {
            ...currentCohort.filters,
            [index]: {
              mode: currentCohort.filters[index].mode,
              root: updated,
            },
          },
          modified: true,
          modifiedDatetime: new Date().toISOString(),
        },
      });
    },
    clearCohortFilters: (
      state,
      action: PayloadAction<ClearAllFilterParams>,
    ) => {
      const { index } = action.payload;
      const currentCohort = getCurrentCohort(state);
      cohortsAdapter.updateOne(state, {
        id: currentCohort.id,
        changes: {
          filters: {
            ...currentCohort.filters,
            [index]: {
              // empty filter set
              mode: 'and',
              root: {},
            } as FilterSet,
          },
          modified: true,
          modifiedDatetime: new Date().toISOString(),
        },
      });
    },
  },
});

const getCurrentCohort = (
  state: EntityState<Cohort, CohortId> & SavedCohortsState,
): Cohort => {
  if (state.currentCohortId) {
    return state.entities[state.currentCohortId];
  }
  return state.entities[DEFAULT_COHORT_ID];
};

// Export actions
export const {
  saveCohort,
  removeSavedCohort,
  resetCurrentCohortId,
  removeAllSavedCohorts,
  setCurrentCohortId,
  updateCohortFilter,
  setCohortFilter,
  removeCohortFilter,
  clearCohortFilters,
  setAllIndexFilters,
} = cohortPersistenceSlice.actions;

// Export selectors
export const {
  selectAll: selectAllSavedCohorts,
  selectTotal: selectTotalCohorts,
  selectById: selectSavedCohortById,
} = cohortsAdapter.getSelectors((state: AppState) => state.savedCohorts);

/**
 * Selects the currently active cohort from the state.
 * Returns the cohort object corresponding to the currentCohortId,
 * or undefined if no cohort is currently selected.
 *
 * @param state - The application state
 * @returns The current Cohort object or undefined
 */
export const selectCurrentCohort = (state: AppState): Cohort => {
  const { currentCohortId, entities } = state.savedCohorts;

  if (!currentCohortId || !entities) {
    return DefaultCohort;
  }

  return entities[currentCohortId];
};

export const selectCurrentCohortId = (state: AppState): string =>
  state.savedCohorts.currentCohortId;

export const selectCohortIdToNameMap = createSelector(
  [selectAllSavedCohorts],
  (cohorts) => {
    return cohorts.reduce<Record<CohortId, string>>((acc, cohort) => {
      acc[cohort.id] = cohort.name;
      return acc;
    }, {});
  },
);

export const selectCurrentCohortName = createSelector(
  [selectCurrentCohort],
  (cohort) => cohort.name,
);

export const selectCurrentCohortFilters = createSelector(
  [selectCurrentCohort],
  (cohort) => cohort.filters,
);

export const selectCurrentIndexedFilterByName = createSelector(
  [selectCurrentCohort, (state, index, field) => ({ index, field })],
  (cohort, params) => {
    return cohort.filters[params.index]?.root[params.field];
  },
);

export const selectCurrentCohortIndexFilters = createSelector(
  [selectCurrentCohort, (state, index) => index],
  (cohort, index) => {
    return cohort.filters?.[index] ?? EmptyFilterSet;
  },
);

// Export reducer
export const saveCohortPersistenceReducer = cohortPersistenceSlice.reducer;
