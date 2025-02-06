import {
  createSlice,
  createSelector,
  type PayloadAction,
} from '@reduxjs/toolkit';

const initialState = {};

type DataLibrarySelectionState = Record<string, Array<string>>;

interface UpdateSelectionParams {
  listId: string;
  itemIds: string[];
}

const dataLibrarySlice = createSlice({
  name: 'dataLibrary',
  initialState,
  reducers: {
    setDataLibraryListSelection: (
      state: DataLibrarySelectionState,
      action: PayloadAction<UpdateSelectionParams>,
    ) => {
      const { listId, itemIds } = action.payload;
      state[listId] = itemIds;
    },
    clearDataLibrarySelection: () => {
      return initialState;
    },
  },
});

export const { setDataLibraryListSelection, clearDataLibrarySelection } =
  dataLibrarySlice.actions;

export const dataLibrarySelectionReducer = dataLibrarySlice.reducer;

// Selector
export const selectDataLibrary = (state: DataLibrarySelectionState) =>
  state.dataLibrarySelection;

// Memoized selector for getting data library items for a specific root object
export const selectRootObjectDataLibrary = createSelector(
  [selectDataLibrary, (_, rootObjectId) => rootObjectId],
  (dataLibrary, rootObjectId) => dataLibrary[rootObjectId] || [],
);
