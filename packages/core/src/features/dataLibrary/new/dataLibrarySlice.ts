import {
  createEntityAdapter,
  createSlice,
  EntityState,
  nanoid,
  type PayloadAction,
  createAsyncThunk,
  ThunkAction,
  UnknownAction,
} from '@reduxjs/toolkit';
import { DataLibrary, Datalist } from '../types';

interface DataLibraryState {
  lists: DataLibrary;
  isLoading: boolean;
  error: string | null;
  lastSyncTime: number | null;
}

const initialState: DataLibraryState = {
  lists: {},
  isLoading: false,
  error: null,
  lastSyncTime: null,
};

type DataLibraryId = string;

const dataLibraryListAdapater = createEntityAdapter<Datalist, DataLibraryId>({
  sortComparer: (a, b) => {
    if (a.updatedTime <= b.updatedTime) return 1;
    else return -1;
  },
  selectId: (list: Datalist): DataLibraryId => list.id,
});

const dataLibrarySlice = createSlice({
  name: 'dataLibrary',
  initialState,
  reducers: {
    setLists: (state, action: PayloadAction<DataLibrary>) => {
      return {
        ...state,
        lists: action.payload,
      };
    },
    addList: (state, action: PayloadAction<Datalist>) => {
      const { id } = action.payload;
      return {
        ...state,
        lists: {
          ...state.lists,
          [id]: action.payload,
        },
      };
    },
    // updateList: (state, action: PayloadAction<Datalist>) => {
    //   return {
    //     ...state,
    //     lists: {
    //       ...state.lists,
    //       [action.payload.id]: action.payload
    //     }
    //   };
    // },
    clearLists: (state) => {
      return {
        ...state,
        lists: {},
      };
    },
    deleteList: (state, action: PayloadAction<string>) => {
      const { [action.payload]: _, ...updatedLists } = state.lists;
      state.lists = updatedLists;
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

export default dataLibrarySlice.reducer;
