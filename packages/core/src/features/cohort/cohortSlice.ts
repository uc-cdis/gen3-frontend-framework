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
import { defaultCohortNameGenerator } from './utils';
import { Cohort, CohortId } from './types';

/**
 *  Cohorts in Gen3 are defined as a set of filters for each index in the data.
 *  This means one cohort id defined for all "tabs" in CohortBuilder (explorer)
 *  Switching a cohort is means that all the cohorts for the index changes.
 */

export const UNSAVED_COHORT_NAME = 'Cohort';
export const NULL_COHORT_ID = 'null_cohort_id';

type CohortId = string;

type CountsData = Record<string, number>;

/**
 * A Cohort is a collection of filters that can be used to query the GDC API.
 * The cohort interface is used to manage the cohort state in the redux-toolkit entity adapter.
 * @see https://redux-toolkit.js.org/api/createEntityAdapter
 *
 * @property id - the id of the cohort
 * @property name - the name of the cohort
 * @property filters - the filters for the cohort
 * @property modified - flag indicating if the cohort has been modified
 * @property modified_datetime - the last time the cohort was modified
 * @property saved - flag indicating if the cohort has been saved
 * @category Cohort
 */
export interface Cohort {
  id: CohortId;
  name: string;
  filters: IndexedFilterSet; // maps of index to filter set
  modified?: boolean; // flag which is set to true if modified and unsaved
  modified_datetime: string; // last time cohort was modified
  saved?: boolean; // flag indicating if cohort has been saved.
  counts?: CountsData; // counts for each index "unit" (e.g. case or study) in the cohort
}

export interface CurrentCohortState {
  currentCohort?: string;
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

interface UpdateCohortAtIdParams {
  id: string;
}

interface UpdateCohortAtIdName extends UpdateCohortAtIdParams {
  name: string;
}

interface UpdateCohortAtIdNameAndSavedStatus extends UpdateCohortAtIdName {
  saved: boolean;
}

export const createCohortName = (postfix: string): string => {
  return `Custom Cohort ${postfix}`;
};

interface ClearAllFilterParams {
  index: string;
}

export const createNewCohort = ({
  filters = {},
  customName,
  id,
}: {
  filters?: IndexedFilterSet;
  customName?: string;
  id?: CohortId;
}): Cohort => {
  const ts = new Date();
  const newName = customName ?? defaultCohortNameGenerator();
  const newId = id ?? createCohortId();
  return {
    name: newName,
    id: newId,
    filters: filters ?? {},
    modified: false,
    saved: false,
    modified_datetime: ts.toISOString(),
    counts: {},
  };
};

export const createCohortId = (): string => nanoid();

const cohortsAdapter = createEntityAdapter<Cohort, CohortId>({
  sortComparer: (a, b) => {
    if (a.modified_datetime <= b.modified_datetime) return 1;
    else return -1;
  },
  selectId: (cohort: Cohort) => cohort.id,
});

// Create an initial unsaved cohort
const initialCohort = createNewCohort({ customName: UNSAVED_COHORT_NAME });

const emptyInitialState = cohortsAdapter.getInitialState<CurrentCohortState>({
  currentCohort: initialCohort.id,
  message: undefined, // message is used to inform frontend components of changes to the cohort.
});

// Set the initial cohort in the adapter state
export const initialState = cohortsAdapter.setOne(
  emptyInitialState,
  initialCohort,
);

const getCurrentCohort = (
  state: EntityState<Cohort, string> & CurrentCohortState,
): CohortId => {
  if (state.currentCohort) {
    return state.currentCohort;
  }
  return NULL_COHORT_ID;
};

/**
 * Redux slice for cohort filters
 */

export const cohortSlice = createSlice({
  name: 'cohort',
  initialState: initialState,
  reducers: {
    addNewDefaultUnsavedCohort: (
      state,
      action: PayloadAction<string | undefined>,
    ) => {
      const cohort = createNewCohort({
        customName: action?.payload ?? UNSAVED_COHORT_NAME, // TODO: add generated name
      });
      cohortsAdapter.addOne(state, cohort);
      state.currentCohort = cohort.id;
      state.message = [`newCohort|${cohort.name}|${cohort.id}`];
    },
    updateCohortName: (state, action: PayloadAction<string>) => {
      cohortsAdapter.updateOne(state, {
        id: getCurrentCohort(state),
        changes: {
          name: action.payload,
          modified: true,
          modified_datetime: new Date().toISOString(),
        },
      });
    },
    updateCohortAtIdNameAndSavedFlag: (
      state,
      action: PayloadAction<UpdateCohortAtIdNameAndSavedStatus>,
    ) => {
      cohortsAdapter.updateOne(state, {
        id: action.payload.id,
        changes: {
          saved: action.payload.saved,
          name: action.payload.name,
          modified: true,
          modified_datetime: new Date().toISOString(),
        },
      });
    },
    updateCohortAtIdIdName: (
      state,
      action: PayloadAction<UpdateCohortAtIdName>,
    ) => {
      cohortsAdapter.updateOne(state, {
        id: action.payload.id,
        changes: {
          name: action.payload.name,
        },
      });
    },
    addUnsavedCohort: (state, action: PayloadAction<Cohort>) => {
      const cohort = action.payload;
      cohortsAdapter.addOne(state, cohort);
      state.message = [`newCohort|${cohort.name}|${cohort.id}`];
    },

    addSavedCohort: (state, action: PayloadAction<Cohort>) => {
      const cohort = action.payload;
      cohortsAdapter.addOne(state, cohort);
    },

    removeCohort: (
      state,
      action: PayloadAction<{
        shouldShowMessage?: boolean;
        id?: string;
      }>,
    ) => {
      const removedCohort =
        state.entities[action?.payload?.id || getCurrentCohort(state)];
      cohortsAdapter.removeOne(
        state,
        action?.payload?.id || getCurrentCohort(state),
      );
      if (action?.payload.shouldShowMessage) {
        state.message = [
          `deleteCohort|${removedCohort?.name}|${state.currentCohort}`,
        ];
      }
    },
    // adds a filter to the cohort filter set at the given index
    updateCohortFilter: (state, action: PayloadAction<UpdateFilterParams>) => {
      const { index, field, filter } = action.payload;
      const currentCohortId = getCurrentCohort(state);

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
                state.entities[currentCohortId]?.filters[index]?.mode ?? 'and',
              root: {
                ...(state.entities[currentCohortId]?.filters[index]?.root ??
                  {}),
                [field]: filter,
              },
            },
          },
          modified: true,
          modified_datetime: new Date().toISOString(),
        },
      });
    },
    setCohortFilter: (state, action: PayloadAction<SetFilterParams>) => {
      const { index, filters } = action.payload;
      const currentCohortId = getCurrentCohort(state);

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
          modified_datetime: new Date().toISOString(),
        },
      });
    },
    setCohortIndexFilters: (
      state,
      action: PayloadAction<SetAllIndexFiltersParams>,
    ) => {
      const currentCohortId = getCurrentCohort(state);

      if (!state.entities[currentCohortId]) {
        console.error(`no cohort with id=${currentCohortId} defined`);
        return;
      }

      cohortsAdapter.updateOne(state, {
        id: currentCohortId,
        changes: {
          filters: action.payload.filters,
          modified: true,
          modified_datetime: new Date().toISOString(),
        },
      });
    },

    // removes a filter to the cohort filter set at the given index
    removeCohortFilter: (state, action: PayloadAction<RemoveFilterParams>) => {
      const { index, field } = action.payload;
      const currentCohortId = getCurrentCohort(state);

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
          modified_datetime: new Date().toISOString(),
        },
      });
    },
    // removes all filters from the cohort filter set at the given index
    clearCohortFilters: (
      state,
      action: PayloadAction<ClearAllFilterParams>,
    ) => {
      const { index } = action.payload;
      const currentCohortId = getCurrentCohort(state);
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
          modified_datetime: new Date().toISOString(),
        },
      });
    },
    discardCohortChanges: (
      state,
      action: PayloadAction<{
        filters: IndexedFilterSet | undefined;
        id?: string;
        modifiedDatetime: string;
      }>,
    ) => {
      /*
       * Discard changes to the cohort filters for all the indexes
       */
      const { id, filters, modifiedDatetime } = action.payload;
      const cohortId = id ?? getCurrentCohort(state);
      cohortsAdapter.updateOne(state, {
        id: cohortId,
        changes: {
          filters: filters,
          modified: false,
          modified_datetime: modifiedDatetime,
        },
      });
    },
    setCurrentCohortId: (state, action: PayloadAction<string>) => {
      state.currentCohort = action.payload;
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
  if (state.cohorts.cohort.currentCohort) {
    return state.cohorts.cohort.currentCohort;
  }
  return NULL_COHORT_ID;
};

export const selectCohortById = (state: CoreState, id: CohortId): Cohort => {
  console.log('selectCohortById', id);
  return cohortSelectors.selectById(state, id);
};

// Filter actions: addFilter, removeFilter, updateFilter
export const {
  updateCohortFilter,
  setCohortFilter,
  setCohortIndexFilters,
  removeCohortFilter,
  clearCohortFilters,
  removeCohort,
  discardCohortChanges,
  addNewDefaultUnsavedCohort,
  addUnsavedCohort,
  setCurrentCohortId,
  addSavedCohort,
  setCohortList,
  updateCohortAtIdNameAndSavedFlag,
} = cohortSlice.actions;

export const selectCurrentCohortFilters = (
  state: CoreState,
): IndexedFilterSet => {
  const currentCohortId = getCurrentCohortFromCoreState(state);
  return state.cohorts.cohort.entities[currentCohortId]?.filters;
};

export const selectCurrentCohortId = (state: CoreState): CohortId => {
  return getCurrentCohort(state.cohorts.cohort);
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

export const setActiveCohortList =
  (
    cohorts?: Cohort[],
  ): ThunkAction<void, CoreState, undefined, UnknownAction> =>
  async (dispatch, getState) => {
    // set the list of all cohorts
    if (cohorts) {
      dispatch(setCohortList(cohorts));
      return;
    }

    const availableCohorts = selectAllCohorts(getState());
    if (Object.keys(availableCohorts).length === 0) {
      dispatch(addNewDefaultUnsavedCohort());
    }
  };

export const discardActiveCohortChanges =
  (
    id: CohortId,
    filters: IndexedFilterSet,
    modifiedDatetime: string,
  ): ThunkAction<void, CoreState, undefined, UnknownAction> =>
  async (dispatch /* getState */) => {
    dispatch(discardCohortChanges({ id, filters, modifiedDatetime }));
  };

export const cohortReducer = cohortSlice.reducer;
