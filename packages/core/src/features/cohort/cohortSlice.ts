import {
  createEntityAdapter,
  createSlice,
  EntityState,
  type PayloadAction,
  nanoid,
} from '@reduxjs/toolkit';
import type { CoreState } from '../../reducers';
import { Operation, FilterSet, IndexedFilterSet } from '../filters';
import { defaultCohortNameGenerator } from './utils';

/**
 *  Cohorts in Gen3 are defined as a set of filters for each index in the data.
 *  This means one cohort id defined for all "tabs" in CohortBuilder (explorer)
 *  Switching a cohort is means that all the cohorts for the index changes.
 */

export const UNSAVED_COHORT_NAME = 'Unsaved_Cohort';

type CohortId = string;

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
  const ts = new Date();
  const newName = customName ?? defaultCohortNameGenerator();
  const newId = createCohortId();
  return {
    name: newName,
    id: newId,
    filters: filters ?? {},
    modified: false,
    saved: false,
    modified_datetime: ts.toISOString(),
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

const emptyInitialState = cohortsAdapter.getInitialState<CurrentCohortState>({
  currentCohort: undefined,
  message: undefined, // message is used to inform frontend components of changes to the cohort.
});

const getCurrentCohort = (
  state: EntityState<Cohort, string> & CurrentCohortState,
): CohortId => {
  if (state.currentCohort) {
    return state.currentCohort;
  }

  const unsavedCohort = newCohort({ customName: UNSAVED_COHORT_NAME });
  return unsavedCohort.id;
};

/**
 * Redux slice for cohort filters
 */

export const cohortSlice = createSlice({
  name: 'cohort',
  initialState: emptyInitialState,
  reducers: {
    addNewDefaultUnsavedCohort: (
      state,
      action: PayloadAction<{
        name?: string;
      }>,
    ) => {
      const cohort = newCohort({
        customName: action.payload.name ?? UNSAVED_COHORT_NAME,
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
    setCohortFilter: (
      state: Draft<CohortState>,
      action: PayloadAction<SetFilterParams>,
    ) => {
      const { index, filters } = action.payload;
      return {
        cohort: {
          ...state.cohort,
          filters: {
            ...state.cohort.filters,
            [index]: filters,
          },
        },
      };
    },
    // removes a filter to the cohort filter set at the given index
    removeCohortFilter: (state, action: PayloadAction<RemoveFilterParams>) => {
      const { index, field } = action.payload;
      const currentCohortId = getCurrentCohort(state);

      if (!state.entities[currentCohortId]) {
        return;
      }
      const filters = state.entities[currentCohortId]?.filters[index]?.root;
      if (!filters) {
        return;
      }
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
  },
});

/**
 * Returns the selectors for the cohorts EntityAdapter
 * @param state - the CoreState
 *
 * @hidden
 */
export const cohortSelectors = cohortsAdapter.getSelectors(
  (state: CoreState) => state.cohorts,
);

const getCurrentCohortFromCoreState = (state: CoreState): CohortId => {
  if (state.cohorts.currentCohort) {
    return state.cohorts.currentCohort;
  }
  const unsavedCohort = newCohort({ customName: UNSAVED_COHORT_NAME });
  return unsavedCohort.id;
};

// Filter actions: addFilter, removeFilter, updateFilter
export const {
  updateCohortFilter,
  setCohortFilter,
  removeCohortFilter,
  clearCohortFilters,
  removeCohort,
  addNewDefaultUnsavedCohort,
} = cohortSlice.actions;

export const selectCohortFilters = (state: CoreState): IndexedFilterSet => {
  const currentCohortId = getCurrentCohortFromCoreState(state);
  return state.entities[currentCohortId]?.filters;
};

export const selectCurrentCohortId = (state: CoreState): CohortId => {
  return getCurrentCohort(state.cohorts);
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
  return (
    cohortSelectors.selectById(state, getCurrentCohortFromCoreState(state))
      .filters?.[index] ?? EmptyFilterSet
  ); // TODO: check if this is undefined
};

export const cohortReducer = cohortSlice.reducer;
