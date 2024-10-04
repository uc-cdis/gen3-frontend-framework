import React, { createContext, useContext, useReducer, Dispatch } from 'react';

// Define types
type RootObjectId = string;
type ItemId = string;

interface DataLibrarySelectionState {
  [key: RootObjectId]: ItemId[];
}

type Action =
  | {
      type: 'UPDATE_DATA_LIBRARY_SELECTION';
      payload: { rootObjectId: RootObjectId; itemIds: ItemId[] };
    }
  | { type: 'CLEAR_DATA_LIBRARY_SELECTION' };

interface DataLibraryContextType {
  state: DataLibrarySelectionState;
  dispatch: Dispatch<Action>;
}

// Create the context
const DataLibrarySelectionContext = createContext<
  DataLibraryContextType | undefined
>(undefined);

// Reducer function
const dataLibrarySelectionReducer = (
  state: DataLibrarySelectionState,
  action: Action,
): DataLibrarySelectionState => {
  switch (action.type) {
    case 'UPDATE_DATA_LIBRARY_SELECTION':
      if (action.payload.itemIds.length === 0) {
        const { [action.payload.rootObjectId]: _, ...restState } = state;
        return restState;
      }
      return {
        ...state,
        [action.payload.rootObjectId]: action.payload.itemIds,
      };
    case 'CLEAR_DATA_LIBRARY_SELECTION':
      return {};
    default:
      return state;
  }
};

// Provider component
export const DataLibrarySelectionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [state, dispatch] = useReducer(dataLibrarySelectionReducer, {});

  return (
    <DataLibrarySelectionContext.Provider value={{ state, dispatch }}>
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
  rootObjectId: RootObjectId,
  itemIds: ItemId[],
): Action => ({
  type: 'UPDATE_DATA_LIBRARY_SELECTION',
  payload: { rootObjectId, itemIds },
});

export const clearDataLibrarySelection = (): Action => ({
  type: 'CLEAR_DATA_LIBRARY_SELECTION',
});

// Selector function
export const selectDataLibrarySelectedItems = (
  state: DataLibrarySelectionState,
  rootObjectId: RootObjectId,
): ItemId[] => state[rootObjectId] || [];
