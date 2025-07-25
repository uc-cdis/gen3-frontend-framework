import {
  createEntityAdapter,
  createSlice,
  EntityState,
  nanoid,
  type PayloadAction,
  ThunkAction,
  UnknownAction,
} from '@reduxjs/toolkit';
import { type CoreState } from '../../reducers';
import { FilterSet, IndexedFilterSet, Operation } from '../filters';
import { defaultCohortNameGenerator, generateUniqueName } from './utils';
import { Cohort, CohortId } from './types';

/**
 *  Cohorts in Gen3 are defined as a set of filters for each index in the data.
 *  This means one cohort id defined for all "tabs" in CohortBuilder (explorer)
 *  Switching a cohort is means that all the cohorts for the index changes.
 */

export const DEFAULT_COHORT_NAME = 'Cohort';
export const NULL_COHORT_ID = 'null_cohort_id';

export interface CurrentCohortState {
  currentCohortId?: string;
  message?: string[];
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

interface SetAllIndexFiltersParams {
  filters: IndexedFilterSet;
}

interface RemoveFilterParams {
  index: string;
  field: string;
}

export const createCohortName = (postfix: string): string => {
  return `Custom Cohort ${postfix}`;
};

interface ClearAllFilterParams {
  index: string;
}

const newCohort = ({
  filters = {},
  customName,
}: {
  filters?: IndexedFilterSet;
  customName?: string;
}): Cohort => {
  const ts = new Date().toISOString();
  const newName = customName ?? defaultCohortNameGenerator();
  const newId = createCohortId();
  return {
    name: newName,
    id: newId,
    filters: filters ?? {},
    modified: false,
    saved: false,
    createdDatetime: ts,
    modifiedDatetime: ts,
    counts: {},
  };
};

export const createCohortId = (): string => nanoid();

const cohortsAdapter = createEntityAdapter<Cohort, CohortId>({
  sortComparer: (a, b) => {
    if (a.modifiedDatetime <= b.modifiedDatetime) return 1;
    else return -1;
  },
  selectId: (cohort: Cohort) => cohort.id,
});

// Create an initial unsaved cohort
const initialCohort = newCohort({ customName: DEFAULT_COHORT_NAME });

const emptyInitialState = cohortsAdapter.getInitialState<CurrentCohortState>({
  currentCohortId: initialCohort.id,
  message: undefined, // message is used to inform frontend components of changes to the cohort.
});

// Set the initial cohort in the adapter state
const initialState = cohortsAdapter.setOne(emptyInitialState, initialCohort);

const getCurrentCohortId = (
  state: EntityState<Cohort, string> & CurrentCohortState,
): CohortId | null => state.currentCohortId ?? null;

interface CreateCohortParams {
  name?: string;
  filters?: IndexedFilterSet;
}

interface UpdateCohortNameParams {
  id: string;
  name: string;
}

/**
 * Redux slice for cohort filters
 */

export const cohortSlice = createSlice({
  name: 'cohort',
  initialState: initialState,
  reducers: {
    createNewCohort: (state, action: PayloadAction<CreateCohortParams>) => {
      const baseName = action.payload.name || `Cohort`;
      const uniqueName = generateUniqueName(
        Object.values(state.entities),
        baseName,
      );

      const cohort = newCohort({
        filters: action.payload.filters,
        customName: uniqueName,
      });
      cohortsAdapter.addOne(state, cohort);
      state.currentCohortId = cohort.id;
    },

    updateCohortName: (
      state,
      action: PayloadAction<UpdateCohortNameParams>,
    ) => {
      const { id, name } = action.payload;
      cohortsAdapter.updateOne(state, {
        id: id,
        changes: {
          name: name,
          modified: true,
          modifiedDatetime: new Date().toISOString(),
        },
      });
    },
    removeCohort: (
      state,
      action: PayloadAction<{
        shouldShowMessage?: boolean;
        id: string;
      }>,
    ) => {
      const removedCohortName = state.entities[action.payload.id].name;
      const totalCohorts = Object.keys(state.entities).length;
      if (totalCohorts <= 1) {
        cohortsAdapter.removeAll(state);
        const defaultCohort = newCohort({
          filters: {},
          customName: DEFAULT_COHORT_NAME,
        });
        cohortsAdapter.addOne(state, defaultCohort);
        state.currentCohortId = defaultCohort.id;
        if (action?.payload.shouldShowMessage) {
          state.message = [
            `deleteCohort|${removedCohortName}|${state.currentCohortId}`,
          ];
        }
        return;
      }

      cohortsAdapter.removeOne(state, action.payload.id);

      if (action?.payload.shouldShowMessage) {
        state.message = [
          `deleteCohort|${removedCohortName}|${state.currentCohortId}`,
        ];
      }
    },
    // adds a filter to the cohort filter set at the given index
    updateCohortFilter: (state, action: PayloadAction<UpdateFilterParams>) => {
      const { index, field, filter } = action.payload;
      const currentCohortId = getCurrentCohortId(state);

      if (currentCohortId) {
        if (!state.entities[currentCohortId]) {
          return;
        }
        cohortsAdapter.updateOne(state, {
          id: currentCohortId,
          changes: {
            filters: {
              ...state.entities[currentCohortId].filters,
              [index]: {
                mode:
                  state.entities[currentCohortId]?.filters[index]?.mode ??
                  'and',
                root: {
                  ...(state.entities[currentCohortId]?.filters[index]?.root ??
                    {}),
                  [field]: filter,
                },
              },
            },
            modified: true,
            modifiedDatetime: new Date().toISOString(),
          },
        });
      }
    },
    setCohortFilter: (state, action: PayloadAction<SetFilterParams>) => {
      const { index, filters } = action.payload;
      const currentCohortId = getCurrentCohortId(state);

      if (currentCohortId) {
        if (!state.entities[currentCohortId]) {
          console.error(`no cohort with id=${currentCohortId} defined`);
          return;
        }

        cohortsAdapter.updateOne(state, {
          id: currentCohortId,
          changes: {
            filters: {
              ...state.entities[currentCohortId].filters,
              [index]: filters,
            },
            modified: true,
            modifiedDatetime: new Date().toISOString(),
          },
        });
      }
    },
    setCohortIndexFilters: (
      state,
      action: PayloadAction<SetAllIndexFiltersParams>,
    ) => {
      const currentCohortId = getCurrentCohortId(state);
      if (currentCohortId) {
        if (!state.entities[currentCohortId]) {
          console.error(`no cohort with id=${currentCohortId} defined`);
          return;
        }

        cohortsAdapter.updateOne(state, {
          id: currentCohortId,
          changes: {
            filters: action.payload.filters,
            modified: true,
            modifiedDatetime: new Date().toISOString(),
          },
        });
      }
    },

    // removes a filter to the cohort filter set at the given index
    removeCohortFilter: (state, action: PayloadAction<RemoveFilterParams>) => {
      const { index, field } = action.payload;
      const currentCohortId = getCurrentCohortId(state);

      if (currentCohortId) {
        if (!state.entities[currentCohortId]) {
          console.error(`no cohort with id=${currentCohortId} defined`);
          return;
        }
        const filters = state.entities[currentCohortId]?.filters[index]?.root;
        if (!filters) {
          return;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [field]: _a, ...updated } = filters;

        cohortsAdapter.updateOne(state, {
          id: currentCohortId,
          changes: {
            filters: {
              ...state.entities[currentCohortId]?.filters,
              [index]: {
                mode: state.entities[currentCohortId].filters[index].mode,
                root: updated,
              },
            },
            modified: true,
            modifiedDatetime: new Date().toISOString(),
          },
        });
      }
    },
    // removes all filters from the cohort filter set at the given index
    clearCohortFilters: (
      state,
      action: PayloadAction<ClearAllFilterParams>,
    ) => {
      const { index } = action.payload;
      const currentCohortId = getCurrentCohortId(state);
      if (currentCohortId) {
        if (!state.entities[currentCohortId]) {
          console.error(`no cohort with id=${currentCohortId} defined`);
          return;
        }
        const filters = state.entities[currentCohortId]?.filters[index]?.root;
        if (!filters) {
          return;
        }

        cohortsAdapter.updateOne(state, {
          id: currentCohortId,
          changes: {
            filters: {
              ...state.entities[currentCohortId]?.filters,
              [index]: {
                mode: 'and',
                root: {},
              },
            },
            modified: true,
            modifiedDatetime: new Date().toISOString(),
          },
        });
      }
    },

    setCurrentCohortId: (state, action: PayloadAction<string>) => {
      state.currentCohortId = action.payload;
    },
    /** @hidden */
    setCohortList: (state, action: PayloadAction<Cohort[]>) => {
      if (!action.payload) {
        cohortsAdapter.removeMany(state, state.ids);
      } else {
        cohortsAdapter.upsertMany(state, [...action.payload] as Cohort[]);
      }
    },
  },
});

/**
 * Returns the selectors for the cohorts EntityAdapter
 * @param state - the CoreState
 *
 * @hidden
 */
export const cohortSelectors = cohortsAdapter.getSelectors(
  (state: CoreState) => state.cohorts.cohort,
);

/**
 * Returns an array of all the cohorts
 * @param state - the CoreState
 * @category Cohort
 * @category Selectors
 */
export const selectAllCohorts = (state: CoreState): Record<CohortId, Cohort> =>
  cohortSelectors.selectEntities(state);

const getCurrentCohortFromCoreState = (state: CoreState): CohortId => {
  if (state.cohorts.cohort.currentCohortId) {
    return state.cohorts.cohort.currentCohortId;
  }
  return NULL_COHORT_ID;
};

// Filter actions: addFilter, removeFilter, updateFilter
export const {
  createNewCohort,
  updateCohortFilter,
  setCohortFilter,
  setCohortIndexFilters,
  removeCohortFilter,
  clearCohortFilters,
  removeCohort,
  setCurrentCohortId,
  setCohortList,
} = cohortSlice.actions;

export const selectCohortFilters = (state: CoreState): IndexedFilterSet => {
  const currentCohortId = getCurrentCohortFromCoreState(state);
  return state.cohorts.cohort.entities[currentCohortId]?.filters;
};

export const selectCurrentCohortFilters = (
  state: CoreState,
): IndexedFilterSet => {
  const currentCohortId = getCurrentCohortFromCoreState(state);
  return state.cohorts.cohort.entities[currentCohortId]?.filters;
};

export const selectCurrentCohortId = (state: CoreState): CohortId | null => {
  return getCurrentCohortId(state.cohorts.cohort);
};

export const selectCurrentCohort = (state: CoreState): Cohort =>
  cohortSelectors.selectById(state, getCurrentCohortFromCoreState(state));

export const selectCurrentCohortName = (state: CoreState): string =>
  cohortSelectors.selectById(state, getCurrentCohortFromCoreState(state)).name;

/**
 * Select a filter by its name from the current cohort. If the filter is not found
 * returns undefined.
 * @param state - Core
 * @param index which cohort index to select from
 * @param name name of the filter to select
 */
export const selectIndexedFilterByName = (
  state: CoreState,
  index: string,
  name: string,
): Operation | undefined => {
  return cohortSelectors.selectById(state, getCurrentCohortFromCoreState(state))
    .filters[index]?.root[name];
};

/**
 * Returns the cohort's name given the id
 * @param state - the CoreState
 * @param cohortId - the cohort id
 * @category Cohort
 * @category Selectors
 */
export const selectCohortNameById = (
  state: CoreState,
  cohortId: string,
): string | undefined => {
  const cohort = cohortSelectors.selectById(state, cohortId);
  return cohort?.name;
};

/**
 * a thunk to optionally create a caseSet when switching cohorts.
 * Note the assumption if the caseset member has ids then the caseset has previously been created.
 */
export const setActiveCohort =
  (cohortId: string): ThunkAction<void, CoreState, undefined, UnknownAction> =>
  async (dispatch /* getState */) => {
    dispatch(setCurrentCohortId(cohortId));
  };

/**
 * Returns all the cohorts in the state
 * @param state - the CoreState
 *
 * @category Cohort
 * @category Selectors
 */

export const selectAvailableCohorts = (state: CoreState): Cohort[] =>
  cohortSelectors.selectAll(state);

/**
 * Returns if the current cohort is modified
 * @param state - the CoreState
 * @category Cohort
 * @category Selectors
 * @hidden
 */
export const selectCurrentCohortModified = (
  state: CoreState,
): boolean | undefined => {
  const cohort = cohortSelectors.selectById(
    state,
    getCurrentCohortFromCoreState(state),
  );
  return cohort?.modified;
};

/**
 * Returns if the current cohort has been saved
 * @param state - the CoreState
 * @category Cohort
 * @category Selectors
 * @hidden
 */
export const selectCurrentCohortSaved = (
  state: CoreState,
): boolean | undefined => {
  const cohort = cohortSelectors.selectById(
    state,
    getCurrentCohortFromCoreState(state),
  );
  return cohort?.saved;
};

/**
 * Select a filter by its name from the current cohort. If the filter is not found
 * returns undefined.
 * @param state - Core
 * @param name name of the filter to select
 */
export const selectAvailableCohortByName = (
  state: CoreState,
  name: string,
): Cohort | undefined =>
  cohortSelectors
    .selectAll(state)
    .find((cohort: Cohort) => cohort.name === name);

const EmptyFilterSet: FilterSet = { mode: 'and', root: {} };

/**
 * Select a filter from the index.
 * returns undefined.
 * @param state - Core
 * @param index which cohort index to select from
 */
export const selectIndexFilters = (
  state: CoreState,
  index: string,
): FilterSet => {
  const cohort = cohortSelectors.selectById(
    state,
    getCurrentCohortFromCoreState(state),
  );
  if (!cohort) {
    console.error('No Cohort Defined');
  }
  return cohort?.filters?.[index] ?? EmptyFilterSet;
};

export const cohortReducer = cohortSlice.reducer;
