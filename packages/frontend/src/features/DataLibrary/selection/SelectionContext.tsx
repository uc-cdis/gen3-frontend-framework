import React, {
  createContext,
  useContext,
  useReducer,
  Dispatch,
  useState,
} from 'react';
import { getSelectedItemsFromDataLibrary } from './utils';
import { DataLibrary, CohortItem } from '@gen3/core';
import { FileItemWithParentDatasetNameAndID } from '../types';
// Define types
type ListId = string;

export type SelectedMembers = Record<string, boolean>;

interface DatasetListMember {
  id: string;
  objectIds: SelectedMembers;
}

export type ListMembers = Record<string, DatasetListMember>;

export interface DataLibrarySelectionState {
  [key: ListId]: ListMembers;
}

type Action =
  | {
      type: 'UPDATE_DATA_LIBRARY_SELECTION';
      payload: { listId: ListId; members: ListMembers };
    }
  | {
      type: 'UPDATE_DATALIST_MEMBER_SELECTION';
      payload: { listId: ListId; memberId: string; selection: SelectedMembers };
    }
  | { type: 'CLEAR_DATA_LIBRARY_SELECTION' }
  | { type: 'DELETE_DATA_LIBRARY_LIST'; payload: { listId: string } }
  | {
      type: 'DELETE_DATA_LIBRARY_LIST_MEMBER';
      payload: { listId: string; memberId: string };
    };

interface DataLibraryContextType {
  selections: DataLibrarySelectionState;
  gatheredItems: Array<CohortItem | FileItemWithParentDatasetNameAndID>;
  updateSelections: (listId: ListId, members: ListMembers) => void;
  updateListMemberSelections: (
    listId: ListId,
    memberId: string,
    selection: SelectedMembers,
  ) => void;
  clearSelections: () => void;
  removeList: (itemId: string) => void;
  removeListMember: (listId: ListId, memberId: string) => void;
  gatherSelectedItems: (dataLibrary: DataLibrary) => void;
  dispatch: Dispatch<Action>;
}

// Create the context
const DataLibrarySelectionContext = createContext<
  DataLibraryContextType | undefined
>(undefined);

// Reducer function
export const dataLibrarySelectionReducer = (
  selections: DataLibrarySelectionState,
  action: Action,
): DataLibrarySelectionState => {
  switch (action.type) {
    case 'UPDATE_DATA_LIBRARY_SELECTION':
      return {
        ...selections,
        [action.payload.listId]: action.payload.members,
      };
    case 'UPDATE_DATALIST_MEMBER_SELECTION':
      if (Object.keys(action.payload.selection).length === 0) {
        // need to remove the dataset
        const {
          [action.payload.listId]: {
            [action.payload.memberId]: _unused,
            ...restState
          },
        } = selections;

        if (Object.keys(restState).length === 0) {
          const { [action.payload.listId]: _unused2, ...restList } = selections;
          return restList;
        }
        return {
          ...selections,
          [action.payload.listId]: {
            ...restState,
          },
        };
      }

      return {
        ...selections,
        [action.payload.listId]: {
          ...selections[action.payload.listId],
          [action.payload.memberId]: {
            id: action.payload.memberId,
            objectIds: action.payload.selection,
          },
        },
      };
    case 'DELETE_DATA_LIBRARY_LIST': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.payload.listId]: _unused, ...restState } = selections;
      return restState;
    }
    case 'DELETE_DATA_LIBRARY_LIST_MEMBER': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      if (!(action.payload.listId in selections)) return selections;
      const {
        [action.payload.listId]: {
          [action.payload.memberId]: _unused,
          ...restState
        },
      } = selections;
      return {
        ...selections,
        [action.payload.listId]: {
          ...restState,
        },
      };
    }
    case 'CLEAR_DATA_LIBRARY_SELECTION':
      return {};
    default:
      return selections;
  }
};

// Provider component
export const DataLibrarySelectionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [selections, dispatch] = useReducer(dataLibrarySelectionReducer, {});
  const [gatheredItems, setGatheredItems] = useState<
    Array<CohortItem | FileItemWithParentDatasetNameAndID>
  >([]);

  const updateSelections = (listId: ListId, members: ListMembers) => {
    dispatch(updateDataLibrarySelection(listId, members));
  };

  const updateListMemberSelections = (
    listId: ListId,
    memberId: string,
    selection: SelectedMembers,
  ) => {
    dispatch(updateDataLibraryListMemberSelection(listId, memberId, selection));
  };

  const clearSelections = () => {
    dispatch(clearDataLibrarySelection());
  };

  const removeList = (listId: ListId) => {
    dispatch(removeDataLibrarySelection(listId));
  };

  const removeListMember = (listId: ListId, memberId: string) => {
    dispatch(removeDataLibraryMemberSelection(listId, memberId));
  };

  const gatherSelectedItems = (dataLibrary?: DataLibrary) => {
    if (dataLibrary) {
      const gatheredItems = getSelectedItemsFromDataLibrary(
        selections,
        dataLibrary,
      );
      setGatheredItems(gatheredItems);
    }
  };

  return (
    <DataLibrarySelectionContext.Provider
      value={{
        selections,
        gatheredItems,
        dispatch,
        updateSelections,
        updateListMemberSelections,
        clearSelections,
        removeList,
        removeListMember,
        gatherSelectedItems,
      }}
    >
      {children}
    </DataLibrarySelectionContext.Provider>
  );
};

// Custom hook for using the data library
export const useDataLibrarySelection = (): DataLibraryContextType => {
  const context = useContext(DataLibrarySelectionContext);
  if (!context) {
    throw new Error('useDataLibrary must be used within a DataLibraryProvider');
  }
  return context;
};

export const updateDataLibrarySelection = (
  listId: ListId,
  members: ListMembers,
): Action => ({
  type: 'UPDATE_DATA_LIBRARY_SELECTION',
  payload: { listId, members },
});

export const updateDataLibraryListMemberSelection = (
  listId: ListId,
  memberId: string,
  selection: SelectedMembers,
): Action => ({
  type: 'UPDATE_DATALIST_MEMBER_SELECTION',
  payload: { listId, memberId, selection },
});

export const clearDataLibrarySelection = (): Action => ({
  type: 'CLEAR_DATA_LIBRARY_SELECTION',
});

export const removeDataLibrarySelection = (listId: ListId): Action => ({
  type: 'DELETE_DATA_LIBRARY_LIST',
  payload: { listId },
});

export const removeDataLibraryMemberSelection = (
  listId: ListId,
  memberId: string,
): Action => ({
  type: 'DELETE_DATA_LIBRARY_LIST_MEMBER',
  payload: { listId, memberId },
});

export const getNumberOfDataSetItemsSelected = (
  selections: DataLibrarySelectionState,
  listId: string,
  itemId: string,
) => {
  return Object.keys(selections?.[listId]?.[itemId]?.objectIds ?? {}).length;
};

export const getNumberOfSelectedItemsInList = (
  selections: DataLibrarySelectionState,
  listId: string,
): number => {
  if (!(listId in selections)) return -1; // return -1 indicating there is no listId in selection

  return Object.keys(selections[listId]).reduce((count: number, datasetId) => {
    try {
      return (
        count + getNumberOfDataSetItemsSelected(selections, listId, datasetId)
      );
    } catch (error) {
      console.error(
        `Failed to get number of selected items for dataset ${datasetId} in list ${listId}:`,
        error,
      );
      return count;
    }
  }, 0);
};

// Selector function
export const selectDataLibrarySelectedItems = (
  selections: DataLibrarySelectionState,
  listId: ListId,
): ListMembers => selections[listId] || [];

export const isListInSelection = (
  listId: ListId,
  selections: DataLibrarySelectionState,
) => listId in selections;
