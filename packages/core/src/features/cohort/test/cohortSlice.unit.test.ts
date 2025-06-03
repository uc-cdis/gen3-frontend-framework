import {
  cohortSlice,
  cohortReducer,
  initialState,
  UNSAVED_COHORT_NAME,
  createNewCohort,
} from '../cohortSlice';
import { FilterSet, Operation } from '../..//filters';

jest.mock('../utils', () => ({
  defaultCohortNameGenerator: () => 'Generated Cohort Name',
}));

describe('cohort slice', () => {
  const mockDate = new Date('2023-01-01T00:00:00.000Z');
  const realDate = Date;

  beforeAll(() => {
    // Mock Date constructor to return a fixed date
    global.Date = class extends Date {
      constructor() {
        super();
        return mockDate;
      }
      static now() {
        return mockDate.getTime();
      }
    } as unknown as DateConstructor;
  });

  afterAll(() => {
    global.Date = realDate;
  });

  describe('reducers', () => {
    // Test addNewDefaultUnsavedCohort reducer
    test('addNewDefaultUnsavedCohort should add a new cohort with default or provided name', () => {
      // Test with default name
      let state = cohortReducer(
        undefined,
        cohortSlice.actions.addNewDefaultUnsavedCohort(),
      );

      expect(state.ids.length).toBe(2); // Initial + new cohort
      const cohortId = state.ids[1] as string;
      expect(state.entities[cohortId].name).toBe(UNSAVED_COHORT_NAME);
      expect(state.currentCohort).toBe(cohortId);
      expect(state.message?.[0]).toContain('newCohort');

      // Test with custom name
      const customName = 'My Custom Cohort';
      state = cohortReducer(
        state,
        cohortSlice.actions.addNewDefaultUnsavedCohort(customName),
      );

      const newCohortId = state.ids[2] as string;
      expect(state.entities[newCohortId].name).toBe(customName);
    });

    // Test updateCohortName reducer
    test('updateCohortName should update the name of the current cohort', () => {
      const initialCohort = createNewCohort({ customName: 'Initial Cohort' });
      const initialStateWithCohort = {
        ...initialState,
        entities: { [initialCohort.id]: initialCohort },
        ids: [initialCohort.id],
        currentCohort: initialCohort.id,
      };

      const newName = 'Updated Cohort Name';
      const state = cohortReducer(
        initialStateWithCohort,
        cohortSlice.actions.updateCohortName(newName),
      );

      expect(state.entities[initialCohort.id].name).toBe(newName);
      expect(state.entities[initialCohort.id].modified).toBe(true);
      expect(state.entities[initialCohort.id].modified_datetime).toBe(
        mockDate.toISOString(),
      );
    });

    // Test addUnsavedCohort reducer
    test('addUnsavedCohort should add the provided cohort', () => {
      const cohort = createNewCohort({ customName: 'New Unsaved Cohort' });
      const state = cohortReducer(
        initialState,
        cohortSlice.actions.addUnsavedCohort(cohort),
      );

      expect(state.entities[cohort.id]).toEqual(cohort);
      expect(state.message?.[0]).toBe(`newCohort|${cohort.name}|${cohort.id}`);
    });

    // Test removeCohort reducer
    test('removeCohort should remove the specified cohort', () => {
      const cohort1 = createNewCohort({ customName: 'Cohort 1' });
      const cohort2 = createNewCohort({ customName: 'Cohort 2' });

      const initialStateWithCohorts = {
        ...initialState,
        entities: {
          [cohort1.id]: cohort1,
          [cohort2.id]: cohort2,
        },
        ids: [cohort1.id, cohort2.id],
        currentCohort: cohort1.id,
      };

      // Remove with ID
      let state = cohortReducer(
        initialStateWithCohorts,
        cohortSlice.actions.removeCohort({ id: cohort2.id }),
      );

      expect(state.entities[cohort2.id]).toBeUndefined();
      expect(state.ids).toEqual([cohort1.id]);

      // Remove current cohort with message
      state = cohortReducer(
        initialStateWithCohorts,
        cohortSlice.actions.removeCohort({ shouldShowMessage: true }),
      );

      expect(state.entities[cohort1.id]).toBeUndefined();
      expect(state.message?.[0]).toContain('deleteCohort');
    });

    // Test updateCohortFilter reducer
    test('updateCohortFilter should add or update a filter for the current cohort', () => {
      const cohort = createNewCohort({
        customName: 'Cohort with Filters',
        filters: {
          index1: {
            mode: 'and',
            root: {
              field1: { operator: 'in', operands: ['value1'], field: 'field1' },
            },
          },
        },
      });

      const initialStateWithCohort = {
        ...initialState,
        entities: { [cohort.id]: cohort },
        ids: [cohort.id],
        currentCohort: cohort.id,
      };

      // Add new filter
      const newFilter: Operation = {
        operator: 'in',
        operands: ['value2'],
        field: 'field1',
      };
      let state = cohortReducer(
        initialStateWithCohort,
        cohortSlice.actions.updateCohortFilter({
          index: 'index1',
          field: 'field2',
          filter: newFilter,
        }),
      );

      expect(
        state.entities[cohort.id].filters['index1'].root['field2'],
      ).toEqual(newFilter);
      expect(state.entities[cohort.id].modified).toBe(true);

      // Update existing filter
      const updatedFilter: Operation = {
        operator: '=',
        operand: 'new-value',
        field: 'field1',
      };
      state = cohortReducer(
        state,
        cohortSlice.actions.updateCohortFilter({
          index: 'index1',
          field: 'field1',
          filter: updatedFilter,
        }),
      );

      expect(
        state.entities[cohort.id].filters['index1'].root['field1'],
      ).toEqual(updatedFilter);
    });

    // Test setCohortFilter reducer
    test('setCohortFilter should set the complete filter for an index', () => {
      const cohort = createNewCohort({ customName: 'Cohort' });

      const initialStateWithCohort = {
        ...initialState,
        entities: { [cohort.id]: cohort },
        ids: [cohort.id],
        currentCohort: cohort.id,
      };

      const newFilter: FilterSet = {
        mode: 'or',
        root: {
          field1: { operator: '=', operand: 'value1', field: 'field1' },
          field2: {
            operator: 'in',
            operands: ['value2', 'value3'],
            field: 'field2',
          },
        },
      };

      const state = cohortReducer(
        initialStateWithCohort,
        cohortSlice.actions.setCohortFilter({
          index: 'index1',
          filters: newFilter,
        }),
      );

      expect(state.entities[cohort.id].filters['index1']).toEqual(newFilter);
      expect(state.entities[cohort.id].modified).toBe(true);
    });

    // Add more tests for other reducers
    // ...
  });
});
