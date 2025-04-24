import { extractDatasetIds, getSelectionPaths, SelectionPath } from '../utils';
import { DataLibrarySelectionState } from '../SelectionContext';
import { ValidatedSelectedItem } from '../../types';

describe('getSelectionPaths', () => {
  it('should return an array of paths based on the state of the data library', () => {
    const state: DataLibrarySelectionState = {
      list1: {
        member1: {
          id: 'member1',
          objectIds: {},
        },
      },
      list2: {
        member2: {
          id: 'member2',
          objectIds: { objectId2: true },
        },
      },
    };

    const result = getSelectionPaths(state);

    expect(result).toEqual([
      {
        listId: 'list1',
        memberId: 'member1',
      },
      {
        listId: 'list2',
        memberId: 'member2',
        objectId: 'objectId2',
      },
    ]);
  });

  it('should return an empty array for empty selection state', () => {
    const state: DataLibrarySelectionState = {};

    const result = getSelectionPaths(state);

    expect(result).toEqual([]);
  });
});

describe('getSelectionPaths', () => {
  const sampleState: DataLibrarySelectionState = {
    list1: {
      member1: {
        id: 'member1',
        objectIds: { obj1: true, obj2: false },
      },
      member2: {
        id: 'member2',
        objectIds: {},
      },
    },
    list2: {
      member3: {
        id: 'member3',
        objectIds: { obj3: true, obj4: true, obj5: false },
      },
    },
    list3: {
      member4: {
        id: 'member4',
        objectIds: { obj6: false, obj7: false },
      },
    },
  };

  it('should correctly generate SelectionPaths', () => {
    const expected: SelectionPath[] = [
      { listId: 'list1', memberId: 'member1', objectId: 'obj1' },
      { listId: 'list1', memberId: 'member2' },
      { listId: 'list2', memberId: 'member3', objectId: 'obj3' },
      { listId: 'list2', memberId: 'member3', objectId: 'obj4' },
    ];

    const result = getSelectionPaths(sampleState);

    expect(result).toEqual(expected);
    expect(result.length).toBe(4);

    // Additional specific checks
    expect(result.filter((path) => path.listId === 'list1').length).toBe(2);
    expect(result.filter((path) => path.listId === 'list2').length).toBe(2);
    expect(result.filter((path) => path.listId === 'list3').length).toBe(0);
    expect(result.filter((path) => path.objectId === undefined).length).toBe(1);
  });
});

describe('extractDatasetIds', () => {
  it('should return an empty array when given an empty array', () => {
    const selections: ReadonlyArray<ValidatedSelectedItem> = [];
    const result = extractDatasetIds(selections);
    expect(result).toEqual([]);
  });

  it('should extract dataset IDs from file items', () => {
    const fileItem1: ValidatedSelectedItem = {
      id: 'file1',
      guid: 'guid1',
      itemType: 'Data',
      datasetId: 'dataset1',
      datasetName: 'Dataset 1',
    };
    const fileItem2: ValidatedSelectedItem = {
      id: 'file2',
      guid: 'guid2',
      itemType: 'Data',
      datasetId: 'dataset2',
      datasetName: 'Dataset 2',
    };

    const selections: ReadonlyArray<ValidatedSelectedItem> = [
      fileItem1,
      fileItem2,
    ];
    const result = extractDatasetIds(selections);

    expect(result).toEqual(['dataset1', 'dataset2']);
    expect(result.length).toBe(2);
  });

  it('should not extract dataset IDs from non-file items', () => {
    const cohortItem: ValidatedSelectedItem = {
      id: 'cohort1',
      itemType: 'Gen3GraphQL',
      data: {},
      name: 'Cohort 1',
      schemaVersion: '1.0',
      datasetId: 'dataset3',
      datasetName: 'Dataset 3',
    };

    const selections: ReadonlyArray<ValidatedSelectedItem> = [cohortItem];
    const result = extractDatasetIds(selections);

    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });

  it('should extract dataset IDs only from file items in a mixed array', () => {
    const fileItem: ValidatedSelectedItem = {
      id: 'file3',
      guid: 'guid3',
      itemType: 'Data',
      datasetId: 'dataset4',
      datasetName: 'Dataset 4',
    };

    const cohortItem: ValidatedSelectedItem = {
      id: 'cohort2',
      itemType: 'Gen3GraphQL',
      data: {},
      name: 'Cohort 2',
      schemaVersion: '1.0',
      datasetId: 'dataset5',
      datasetName: 'Dataset 5',
    };

    const selections: ReadonlyArray<ValidatedSelectedItem> = [
      fileItem,
      cohortItem,
    ];
    const result = extractDatasetIds(selections);

    expect(result).toEqual(['dataset4']);
    expect(result.length).toBe(1);
  });
});
