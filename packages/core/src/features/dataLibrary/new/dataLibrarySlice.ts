import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { DataLibrary, Datalist } from '../types';

export interface DataLibraryState {
  isLoading: boolean;
  error: string | null;
  lastSyncTime: number | null;
}

type DataLibraryId = string;

export const dataLibraryListAdapter = createEntityAdapter<
  Datalist,
  DataLibraryId
>({
  sortComparer: (a, b) => {
    if (a.updatedTime <= b.updatedTime) return 1;
    else return -1;
  },
  selectId: (list: Datalist): DataLibraryId => list.id,
});

const initialState = dataLibraryListAdapter.getInitialState<DataLibraryState>({
  isLoading: false,
  error: null,
  lastSyncTime: null,
});

const dataLibrarySlice = createSlice({
  name: 'dataLibrary',
  initialState,
  reducers: {
    setLists: (state, action: PayloadAction<DataLibrary>) => {
      // @ts-expect-error have issue with deep object
      dataLibraryListAdapter.setAll(state, Object.values(action.payload));
    },
    addList: (state, action: PayloadAction<Datalist>) => {
      dataLibraryListAdapter.addOne(state, action.payload);
    },
    updateList: (state, action: PayloadAction<Datalist>) => {
      dataLibraryListAdapter.upsertOne(state, action.payload);
    },
    clearLists: (state) => {
      dataLibraryListAdapter.removeAll(state);
    },
    deleteList: (state, action: PayloadAction<DataLibraryId>) => {
      dataLibraryListAdapter.removeOne(state, action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSyncTime: (state, action: PayloadAction<number>) => {
      state.lastSyncTime = action.payload;
    },
  },
});

export const {
  setLists,
  addList,
  updateList,
  clearLists,
  deleteList,
  setLoading,
  setError,
  setSyncTime,
} = dataLibrarySlice.actions;

export const dataLibraryReducer = dataLibrarySlice.reducer;
