import * as cohortSlice from '../cohortManagerSlice';
import {
  cohortReducer,
  CurrentCohortState,
  DEFAULT_COHORT_NAME,
  newCohort,
} from '../cohortManagerSlice';
import { Cohort, CohortId } from '../types';
import { EntityState } from '@reduxjs/toolkit';

//const initialCohort = newCohort({ customName: DEFAULT_COHORT_NAME });

// const INITIAL_ID = '000-000-000-0';
// const INITIAL_COHORTS = {
//   [INITIAL_ID]: { ...initialCohort, id: INITIAL_ID },
// };
//
// const INITIAL_STATE: EntityState<Cohort, CohortId> & CurrentCohortState = {
//   currentCohortId: Object.keys(INITIAL_COHORTS)[0],
//   ids: Object.keys(INITIAL_COHORTS),
//   entities: INITIAL_COHORTS,
//   message: undefined, // message is used to inform frontend components of changes to the cohort.
// };

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
