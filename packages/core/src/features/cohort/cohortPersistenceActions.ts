import { createAsyncThunk } from '@reduxjs/toolkit';
import type { CoreState } from '../../reducers';
import type { Cohort } from './cohortSlice';
import {
  setCurrentCohortId,
  setCohortList,
  removeCohort,
  addNewDefaultUnsavedCohort,
} from './cohortSlice';
import {
  saveCohort,
  loadCohorts,
  deleteCohort,
  deleteAllCohorts,
  loadCohortById,
} from './cohortPersistenceService';

/**
 * Save the current cohort to IndexDB
 */
export const persistCurrentCohort = createAsyncThunk(
  'cohort/persistCurrent',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as CoreState;
      const currentCohortId = state.cohorts.currentCohort;
      if (!currentCohortId) {
        throw new Error('No current cohort to save');
      }
      const currentCohort = state.cohorts.entities[currentCohortId];
      const cohortId = await saveCohort(currentCohort);
      return cohortId;
    } catch (error) {
      if (error instanceof Error) return rejectWithValue(error.message);
      else return rejectWithValue('Unknown error saving cohort.');
    }
  },
);

/**
 * Save a specific cohort to IndexDB
 */
export const persistCohort = createAsyncThunk(
  'cohort/persist',
  async (cohort: Cohort, { rejectWithValue }) => {
    try {
      const cohortId = await saveCohort(cohort);
      return cohortId;
    } catch (error) {
      if (error instanceof Error) return rejectWithValue(error.message);
      else return rejectWithValue('Unknown error saving cohort.');
    }
  },
);

/**
 * Load all cohorts from IndexDB and update the Redux store
 */
export const loadStoredCohorts = createAsyncThunk(
  'cohort/loadAll',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const cohorts = await loadCohorts();

      if (cohorts.length > 0) {
        // Update the cohort list in Redux
        dispatch(setCohortList(cohorts));
        // Set the most recently modified cohort as current
        const mostRecent = cohorts.reduce((prev, current) => {
          return new Date(prev.modified_datetime) >
            new Date(current.modified_datetime)
            ? prev
            : current;
        });
        dispatch(setCurrentCohortId(mostRecent.id));
      } else {
        // If no cohorts exist, create a default one
        dispatch(addNewDefaultUnsavedCohort());
      }

      return cohorts;
    } catch (error) {
      if (error instanceof Error) return rejectWithValue(error.message);
      else return rejectWithValue('Unknown error loading cohort.');
    }
  },
);

/**
 * Delete a cohort from both IndexDB and Redux store
 */
export const removeStoredCohort = createAsyncThunk(
  'cohort/removeStored',
  async (
    {
      cohortId,
      shouldShowMessage = true,
    }: { cohortId: string; shouldShowMessage?: boolean },
    { dispatch, rejectWithValue },
  ) => {
    try {
      await deleteCohort(cohortId);
      dispatch(removeCohort({ id: cohortId, shouldShowMessage }));
      return cohortId;
    } catch (error) {
      if (error instanceof Error) return rejectWithValue(error.message);
      else return rejectWithValue('Unknown error deleting cohort.');
    }
  },
);

/**
 * Delete all cohorts from IndexDB and reset Redux store
 */
export const clearAllStoredCohorts = createAsyncThunk(
  'cohort/clearAllStored',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await deleteAllCohorts();
      // Clear the cohort list and create a new default cohort
      dispatch(setCohortList([]));
      dispatch(addNewDefaultUnsavedCohort());
      return true;
    } catch (error) {
      if (error instanceof Error) return rejectWithValue(error.message);
      return rejectWithValue('Unknown error deleting all cohorts.');
    }
  },
);

/**
 * Load a specific cohort by ID and set it as current
 */
export const loadAndSetCohort = createAsyncThunk(
  'cohort/loadAndSet',
  async (cohortId: string, { dispatch, rejectWithValue }) => {
    try {
      const cohort = await loadCohortById(cohortId);

      if (!cohort) {
        throw new Error(`Cohort with id ${cohortId} not found`);
      }

      // Update the cohort in the store and set it as current
      dispatch(setCohortList([cohort]));
      dispatch(setCurrentCohortId(cohortId));

      return cohort;
    } catch (error) {
      if (error instanceof Error) return rejectWithValue(error.message);
      return rejectWithValue('Unknown error loading cohorts');
    }
  },
);
