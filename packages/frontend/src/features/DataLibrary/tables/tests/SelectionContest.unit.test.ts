import {
  dataLibrarySelectionReducer,
  updateDataLibrarySelection,
  updateDataLibraryListMemberSelection,
  clearDataLibrarySelection,
  DataLibrarySelectionState,
  ListMembers,
  SelectedMembers,
} from '../SelectionContext'; // Update this import path as needed

describe('DataLibrarySelection', () => {
  let initialState: DataLibrarySelectionState;

  beforeEach(() => {
    initialState = {};
  });

  test('updateDataLibrarySelection should update the selections state', () => {
    const listId = 'list1';
    const members: ListMembers = {
      member1: {
        id: 'member1',
        objectIds: { obj1: true, obj2: true },
      },
    };

    const action = updateDataLibrarySelection(listId, members);
    const newState = dataLibrarySelectionReducer(initialState, action);

    expect(newState).toEqual({
      [listId]: members,
    });
  });

  test('updateDataLibraryListMemberSelection should update a specific member selection', () => {
    const listId = 'list1';
    const memberId = 'member1';
    const selection: SelectedMembers = { obj1: true, obj2: false };

    const action = updateDataLibraryListMemberSelection(
      listId,
      memberId,
      selection,
    );
    const newState = dataLibrarySelectionReducer(initialState, action);

    expect(newState).toEqual({
      [listId]: {
        [memberId]: {
          id: memberId,
          objectIds: selection,
        },
      },
    });
  });

  test('clearDataLibrarySelection should reset the selections state', () => {
    // First, add some selections
    const populatedState: DataLibrarySelectionState = {
      list1: {
        member1: {
          id: 'member1',
          objectIds: { obj1: true },
        },
      },
    };

    const action = clearDataLibrarySelection();
    const newState = dataLibrarySelectionReducer(populatedState, action);

    expect(newState).toEqual({});
  });

  test('updateDataLibrarySelection should remove list when empty members are provided', () => {
    const initialStateWithList: DataLibrarySelectionState = {
      list1: {
        member1: {
          id: 'member1',
          objectIds: { obj1: true },
        },
      },
    };

    const action = updateDataLibrarySelection('list1', {});
    const newState = dataLibrarySelectionReducer(initialStateWithList, action);

    expect(newState).toEqual({});
  });

  test('updateDataLibraryListMemberSelection should remove member when empty selection is provided', () => {
    const initialStateWithMember: DataLibrarySelectionState = {
      list1: {
        member1: {
          id: 'member1',
          objectIds: { obj1: true },
        },
      },
    };

    const action = updateDataLibraryListMemberSelection('list1', 'member1', {});
    const newState = dataLibrarySelectionReducer(
      initialStateWithMember,
      action,
    );

    expect(newState).toEqual({});
  });

  test('updateDataLibraryListMemberSelection should remove member when empty selection is provided', () => {
    const initialStateWithMember: DataLibrarySelectionState = {
      list1: {
        member1: {
          id: 'member1',
          objectIds: { obj1: true },
        },
        member2: {
          id: 'member2',
          objectIds: { obj2: true, obj3: true },
        },
      },
    };

    const action = updateDataLibraryListMemberSelection('list1', 'member1', {});
    const newState = dataLibrarySelectionReducer(
      initialStateWithMember,
      action,
    );

    expect(newState).toEqual({
      list1: {
        member2: {
          id: 'member2',
          objectIds: {
            obj2: true,
            obj3: true,
          },
        },
      },
    });
  });
});
