import * as cohortSlice from '../cohortManagerSlice';
import {
  cohortReducer,
  createNewCohort,
  CurrentCohortState,
  DEFAULT_COHORT_NAME,
  duplicateCohort,
  newCohort,
  removeCohort,
} from '../cohortManagerSlice';
import { Cohort, CohortId } from '../types';
import { EntityState } from '@reduxjs/toolkit';

const STATE_WITH_2_COHORTS = {
  currentCohortId: '000-000-000-2',
  entities: {
    '000-000-000-1': {
      counts: {},
      createdDatetime: '2025-01-25T10:30:00.000Z',
      filters: {},
      id: '000-000-000-1',
      modified: false,
      modifiedDatetime: '2025-01-25T10:30:00.000Z',
      name: 'Cohort',
      saved: false,
    },
    '000-000-000-2': {
      counts: {},
      createdDatetime: '2025-01-25T10:30:00.000Z',
      filters: {},
      id: '000-000-000-2',
      modified: false,
      modifiedDatetime: '2025-01-25T10:30:00.000Z',
      name: 'Other Cohort',
      saved: false,
    },
  },
  ids: ['000-000-000-1', '000-000-000-2'],
};

describe('cohortManagerSlice Initial State', () => {
  const mockDate = new Date('2025-01-25T10:30:00.000Z');
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

  jest
    .spyOn(cohortSlice, 'createCohortId')
    .mockReturnValueOnce('000-000-000-1');

  const initialCohort = newCohort({ customName: DEFAULT_COHORT_NAME });

  const localState: EntityState<Cohort, CohortId> & CurrentCohortState = {
    currentCohortId: initialCohort.id,
    ids: [initialCohort.id],
    entities: { [initialCohort.id]: initialCohort },
    message: undefined, // message is used to inform frontend components of changes to the cohort.
  };

  test('should return the default state for unknown actions', () => {
    const testState = cohortReducer(localState, { type: 'asdf' });
    expect(testState).toEqual({
      currentCohortId: '000-000-000-1',
      entities: {
        '000-000-000-1': {
          counts: {},
          createdDatetime: '2025-01-25T10:30:00.000Z',
          filters: {},
          id: '000-000-000-1',
          modified: false,
          modifiedDatetime: '2025-01-25T10:30:00.000Z',
          name: 'Cohort',
          saved: false,
        },
      },
      ids: ['000-000-000-1'],
    });
  });
});

describe('cohortManagerSlice add, update, duplicate, and remove cohort', () => {
  const mockDate = new Date('2025-01-25T10:30:00.000Z');

  jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

  jest
    .spyOn(cohortSlice, 'createCohortId')
    .mockReturnValueOnce('000-000-000-1')
    .mockReturnValueOnce('000-000-000-2')
    .mockReturnValueOnce('000-000-000-3')
    .mockReturnValueOnce('000-000-000-4');

  const initialCohort = newCohort({ customName: DEFAULT_COHORT_NAME });

  const localState: EntityState<Cohort, CohortId> & CurrentCohortState = {
    currentCohortId: initialCohort.id,
    ids: [initialCohort.id],
    entities: { [initialCohort.id]: initialCohort },
    message: undefined, // message is used to inform frontend components of changes to the cohort.
  };

  test('add cohort', () => {
    const testState = cohortReducer(
      localState,
      createNewCohort({ filters: {}, name: 'Other Cohort' }),
    );

    expect(testState).toEqual(STATE_WITH_2_COHORTS);
  });

  test('delete cohort', () => {
    const testState = cohortReducer(
      STATE_WITH_2_COHORTS,
      removeCohort({ shouldShowMessage: true, id: '000-000-000-1' }),
    );

    expect(testState).toEqual({
      currentCohortId: '000-000-000-2',
      entities: {
        '000-000-000-2': {
          counts: {},
          createdDatetime: '2025-01-25T10:30:00.000Z',
          filters: {},
          id: '000-000-000-2',
          modified: false,
          modifiedDatetime: '2025-01-25T10:30:00.000Z',
          name: 'Other Cohort',
          saved: false,
        },
      },
      ids: ['000-000-000-2'],
      message: ['deleteCohort|Cohort|000-000-000-2'],
    });
  });

  test('delete last cohort', () => {
    const testState = cohortReducer(
      localState,
      removeCohort({ shouldShowMessage: true, id: '000-000-000-1' }),
    );

    expect(testState).toEqual({
      currentCohortId: '000-000-000-3',
      entities: {
        '000-000-000-3': {
          counts: {},
          createdDatetime: '2025-01-25T10:30:00.000Z',
          filters: {},
          id: '000-000-000-3',
          modified: false,
          modifiedDatetime: '2025-01-25T10:30:00.000Z',
          name: 'Cohort',
          saved: false,
        },
      },
      ids: ['000-000-000-3'],
      message: ['deleteCohort|Cohort|000-000-000-3'],
    });
  });

  test('duplicate cohort', () => {
    const testState = cohortReducer(STATE_WITH_2_COHORTS, duplicateCohort());

    expect(testState).toEqual({
      currentCohortId: '000-000-000-4',
      entities: {
        '000-000-000-1': {
          counts: {},
          createdDatetime: '2025-01-25T10:30:00.000Z',
          filters: {},
          id: '000-000-000-1',
          modified: false,
          modifiedDatetime: '2025-01-25T10:30:00.000Z',
          name: 'Cohort',
          saved: false,
        },
        '000-000-000-2': {
          counts: {},
          createdDatetime: '2025-01-25T10:30:00.000Z',
          filters: {},
          id: '000-000-000-2',
          modified: false,
          modifiedDatetime: '2025-01-25T10:30:00.000Z',
          name: 'Other Cohort',
          saved: false,
        },
        '000-000-000-4': {
          counts: {},
          createdDatetime: '2025-01-25T10:30:00.000Z',
          filters: {},
          id: '000-000-000-4',
          modified: false,
          modifiedDatetime: '2025-01-25T10:30:00.000Z',
          name: 'Other Cohort (1)',
          saved: false,
        },
      },
      ids: ['000-000-000-1', '000-000-000-2', '000-000-000-4'],
    });
  });
});
