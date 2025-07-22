import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  EntityId,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import { FilterSet, IndexedFilterSet, Operation } from '@gen3/core';
import { Cohort, CohortId, newCohort } from '../types';
import { cohortStorage } from './DiscoveryCohortStorage';
import { EmptyFilterSet } from './types';

const isNameUnique = <T, K extends EntityId>(
  state: EntityState<T, K> & CohortManagerState,
  name: string,
  excludeId?: string,
): boolean => {
  const trimmedName = name.trim();
  if (!trimmedName) return false;

  return !Object.values(state.entities).some(
    (cohort) =>
      cohort &&
      cohort.id !== excludeId &&
      cohort.name.trim().toLowerCase() === trimmedName.toLowerCase(),
  );
};

const generateUniqueName = (
  state: EntityState<Cohort, CohortId> & CohortManagerState,
  baseName: string,
): string => {
  const trimmedBaseName = baseName.trim();

  // If base name is unique, use it
  if (isNameUnique(state, trimmedBaseName)) {
    return trimmedBaseName;
  }

  // Find a unique name by appending numbers
  let counter = 1;
  let uniqueName: string;

  do {
    uniqueName = `${trimmedBaseName} (${counter})`;
    counter++;
  } while (!isNameUnique(state, uniqueName));

  return uniqueName;
};

export const createDefaultCohort = () =>
  newCohort(DEFAULT_COHORT_NAME, {}, undefined, false);

// Entity adapter
export const cohortsAdapter = createEntityAdapter<Cohort, CohortId>({
  selectId: (cohort: Cohort) => cohort.id,
  sortComparer: (a, b) => {
    if (a.modifiedDatetime > b.modifiedDatetime) return -1;
    if (a.modifiedDatetime < b.modifiedDatetime) return 1;
    return 0;
  },
});

export interface CohortManagerState {
  currentCohortId: string;
  loading: boolean;
  uninitialized: boolean;
  error: string | null;
  autoSaveInProgress: string[];
}

//const DEFAULT_COHORT_ID = 'default';
const DEFAULT_COHORT_NAME = 'Default';

export const loadCohortsFromStorage = createAsyncThunk(
  'cohorts/loadFromStorage',
  async (): Promise<Cohort[]> => {
    try {
      const results = await cohortStorage.getAllCohorts();
      if (results.data) return Object.values(results.data);
      else return [];
    } catch (error) {
      console.error('Failed to load cohorts:', error);
      return [];
    }
  },
);

interface SaveCohortParams {
  cohortId: string;
  cohortName?: string;
}
export const saveCohortToStorage = createAsyncThunk(
  'cohorts/saveToStorage',
  async (params: SaveCohortParams, { getState }): Promise<Cohort> => {
    const { cohortId, cohortName } = params;
    const state = getState() as {
      cohorts: EntityState<Cohort, CohortId> & CohortManagerState;
    };
    const cohort = state.cohorts.entities[cohortId];

    if (!cohort) {
      throw new Error(`Cohort with id ${cohortId} not found`);
    }

    const cohortToSave: Cohort = {
      ...cohort,
      name: cohortName || cohort.name,
      saved: true,
      modified: false,
      modifiedDatetime: new Date().toISOString(),
    };

    await cohortStorage.saveCohort(cohortToSave);
    return cohortToSave;
  },
);

export const autoSaveCohort = createAsyncThunk(
  'cohorts/autoSave',
  async (cohortId: string, { getState }): Promise<Cohort> => {
    const state = getState() as {
      cohorts: EntityState<Cohort, CohortId> & CohortManagerState;
    };
    const cohort = state.cohorts.entities[cohortId];

    if (!cohort || !cohort.saved) {
      throw new Error(`Cannot auto-save unsaved cohort ${cohortId}`);
    }

    const cohortToSave: Cohort = {
      ...cohort,
      modified: false,
      modifiedDatetime: new Date().toISOString(),
    };

    await cohortStorage.saveCohort(cohortToSave);
    return cohortToSave;
  },
);

export const deleteCohortFromStorage = createAsyncThunk(
  'cohorts/deleteFromStorage',
  async (cohortId: string): Promise<string> => {
    await cohortStorage.deleteCohort(cohortId);
    return cohortId;
  },
);

// Action payload interfaces
interface CreateCohortParams {
  name?: string;
  filters?: IndexedFilterSet;
}

interface UpdateCohortNameParams {
  id: string;
  name: string;
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

const emptyInitialState = cohortsAdapter.getInitialState<CohortManagerState>({
  currentCohortId: 'uninitialized',
  loading: false,
  uninitialized: true,
  error: null,
  autoSaveInProgress: [],
});

// const initialState = emptyInitialState;

const initialState = cohortsAdapter.addOne(
  emptyInitialState,
  createDefaultCohort(),
);

const updateAutoSave = (cohortId: string, state: CohortManagerState) => {
  // Add to auto-save queue if not already present
  if (!state.autoSaveInProgress.includes(cohortId)) {
    state.autoSaveInProgress.push(cohortId);
  }
};

export const cohortManagerSlice = createSlice({
  name: 'CohortDiscovery/CohortManager',
  initialState,
  reducers: {
    setCurrentCohortId: (state, action: PayloadAction<string>) => {
      if (state.entities[action.payload]) {
        state.currentCohortId = action.payload;
      }
    },

    createNewCohort: (state, action: PayloadAction<CreateCohortParams>) => {
      const baseName = action.payload.name || `New Cohort`;
      const uniqueName = generateUniqueName(state, baseName);

      const cohort = newCohort(
        uniqueName,
        action.payload.filters || {},
        undefined,
        false,
      );
      cohortsAdapter.addOne(state, cohort);
      state.currentCohortId = cohort.id;
    },

    removeCohort: (state, action: PayloadAction<string>) => {
      const cohortId = action.payload;
      const totalCohorts = Object.keys(state.entities).length;

      if (totalCohorts <= 1) {
        cohortsAdapter.removeAll(state);
        const defaultCohort = createDefaultCohort();
        cohortsAdapter.addOne(state, defaultCohort);
        state.currentCohortId = defaultCohort.id;
        return;
      }

      cohortsAdapter.removeOne(state, cohortId);

      if (state.currentCohortId === cohortId) {
        const remainingIds = Object.keys(state.entities);
        state.currentCohortId = remainingIds[0];
      }

      state.autoSaveInProgress = state.autoSaveInProgress.filter(
        (id) => id !== cohortId,
      );
    },

    updateCohortName: (
      state,
      action: PayloadAction<UpdateCohortNameParams>,
    ) => {
      const { id, name } = action.payload;
      const cohort = state.entities[id];

      if (!cohort) return;

      const trimmedName = name.trim();

      // Don't update if name is empty
      if (!trimmedName) return;

      // Don't update if name hasn't changed
      if (cohort.name === trimmedName) return;

      // Check if name is unique (excluding current cohort)
      if (!isNameUnique(state, trimmedName, id)) {
        // Set error for duplicate name
        state.error = `A cohort named "${trimmedName}" already exists. Please choose a different name.`;
        return;
      }

      const wasSaved = cohort.saved;

      cohortsAdapter.updateOne(state, {
        id,
        changes: {
          name: trimmedName,
          modified: !wasSaved,
          modifiedDatetime: new Date().toISOString(),
        },
      });

      if (wasSaved) {
        // Add to auto-save queue if not already present
        updateAutoSave(id, state);
      }
    },

    updateCohortFilter: (state, action: PayloadAction<UpdateFilterParams>) => {
      const { index, field, filter } = action.payload;
      const currentCohort = getCurrentCohort(state);
      const wasSaved = currentCohort.saved;

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
          modified: !wasSaved,
          modifiedDatetime: new Date().toISOString(),
        },
      });

      if (wasSaved) {
        // Add to auto-save queue if not already present
        updateAutoSave(currentCohort.id, state);
      }
    },

    setCohortFilter: (state, action: PayloadAction<SetFilterParams>) => {
      const { index, filters } = action.payload;
      const currentCohort = getCurrentCohort(state);
      const wasSaved = currentCohort.saved;

      cohortsAdapter.updateOne(state, {
        id: currentCohort.id,
        changes: {
          filters: {
            ...currentCohort.filters,
            [index]: filters,
          },
          modified: !wasSaved,
          modifiedDatetime: new Date().toISOString(),
        },
      });

      if (wasSaved) {
        updateAutoSave(currentCohort.id, state);
      }
    },

    setAllIndexFilters: (state, action: PayloadAction<IndexedFilterSet>) => {
      const currentCohort = getCurrentCohort(state);
      const wasSaved = currentCohort.saved;

      cohortsAdapter.updateOne(state, {
        id: currentCohort.id,
        changes: {
          filters: action.payload,
          modified: !wasSaved,
          modifiedDatetime: new Date().toISOString(),
        },
      });

      if (wasSaved) {
        updateAutoSave(currentCohort.id, state);
      }
    },

    removeCohortFilter: (state, action: PayloadAction<RemoveFilterParams>) => {
      const { index, field } = action.payload;
      const currentCohort = getCurrentCohort(state);
      const filters = currentCohort.filters?.[index]?.root;
      const wasSaved = currentCohort.saved;

      if (!filters) return;

      const { [field]: _removed, ...updated } = filters;

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
          modified: !wasSaved,
          modifiedDatetime: new Date().toISOString(),
        },
      });

      if (wasSaved) {
        updateAutoSave(currentCohort.id, state);
      }
    },

    clearCohortFilters: (
      state,
      action: PayloadAction<ClearAllFilterParams>,
    ) => {
      const { index } = action.payload;
      const currentCohort = getCurrentCohort(state);
      const wasSaved = currentCohort.saved;

      cohortsAdapter.updateOne(state, {
        id: currentCohort.id,
        changes: {
          filters: {
            ...currentCohort.filters,
            [index]: EmptyFilterSet,
          },
          modified: !wasSaved,
          modifiedDatetime: new Date().toISOString(),
        },
      });

      if (wasSaved) {
        updateAutoSave(currentCohort.id, state);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loadCohortsFromStorage.pending, (state) => {
        state.loading = true;
        state.uninitialized = false;
        state.error = null;
        console.log('loadCohortsFromStorage.pending');
      })
      .addCase(loadCohortsFromStorage.fulfilled, (state, action) => {
        state.loading = false;
        console.log('loadCohortsFromStorage.fulfilled', action.payload);
        if (action.payload.length > 0) {
          if (Object.keys(state.entities).length >= 0) {
            cohortsAdapter.removeAll(state);
          }
          cohortsAdapter.addMany(state, action.payload);

          const sortedCohorts = action.payload.sort((a, b) =>
            b.modifiedDatetime.localeCompare(a.modifiedDatetime),
          );
          state.currentCohortId = sortedCohorts[0].id;
        } else {
          // No cohorts in storage, create default cohort
          const defaultCohort = createDefaultCohort();
          cohortsAdapter.addOne(state, defaultCohort);
          state.currentCohortId = defaultCohort.id;
        }
      })
      .addCase(loadCohortsFromStorage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load cohorts';
      })

      .addCase(saveCohortToStorage.fulfilled, (state, action) => {
        cohortsAdapter.updateOne(state, {
          id: action.payload.id,
          changes: action.payload,
        });
      })
      .addCase(saveCohortToStorage.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to save cohort';
      })

      .addCase(autoSaveCohort.pending, (state, action) => {
        updateAutoSave(action.meta.arg, state);
      })
      .addCase(autoSaveCohort.fulfilled, (state, action) => {
        state.autoSaveInProgress = state.autoSaveInProgress.filter(
          (id) => id !== action.payload.id,
        );
        cohortsAdapter.updateOne(state, {
          id: action.payload.id,
          changes: action.payload,
        });
      })
      .addCase(autoSaveCohort.rejected, (state, action) => {
        state.autoSaveInProgress = state.autoSaveInProgress.filter(
          (id) => id !== action.meta.arg,
        );
        console.warn(
          `Auto-save failed for cohort ${action.meta.arg}:`,
          action.error.message,
        );
      })

      .addCase(deleteCohortFromStorage.fulfilled, (state, action) => {
        const cohortId = action.payload;
        const totalCohorts = Object.keys(state.entities).length;

        if (totalCohorts <= 1) {
          cohortsAdapter.removeAll(state);
          const defaultCohort = createDefaultCohort();
          cohortsAdapter.addOne(state, defaultCohort);
          state.currentCohortId = defaultCohort.id;
        } else {
          cohortsAdapter.removeOne(state, cohortId);
          if (state.currentCohortId === cohortId) {
            const remainingIds = Object.keys(state.entities);
            state.currentCohortId = remainingIds[0];
          }
        }

        state.autoSaveInProgress = state.autoSaveInProgress.filter(
          (id) => id !== cohortId,
        );
      });
  },
});

// Helper function
const getCurrentCohort = (
  state: EntityState<Cohort, CohortId> & CohortManagerState,
): Cohort => {
  const cohort = state.entities[state.currentCohortId];
  if (!cohort) {
    return createDefaultCohort();
  }
  return cohort;
};

// Actions export
export const {
  setCurrentCohortId,
  createNewCohort,
  removeCohort,
  updateCohortName,
  updateCohortFilter,
  setCohortFilter,
  setAllIndexFilters,
  removeCohortFilter,
  clearCohortFilters,
} = cohortManagerSlice.actions;

export const cohortManagerReducer = cohortManagerSlice.reducer;

export const validateCohortName =
  (name: string, excludeId?: string) => (dispatch: any, getState: any) => {
    const state = getState();
    return isNameUnique(state.cohorts, name, excludeId);
  };

export const generateUniqueNameForCohort =
  (baseName: string) => (dispatch: any, getState: any) => {
    const state = getState();
    return generateUniqueName(state.cohorts, baseName);
  };
