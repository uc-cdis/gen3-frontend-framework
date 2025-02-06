import { getSelectionPaths, SelectionPath } from '../utils';
import { DataLibrarySelectionState } from '../SelectionContext';

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
