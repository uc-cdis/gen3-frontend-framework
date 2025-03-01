import { combineReducers } from '@reduxjs/toolkit';
import { dataLibrarySelectionReducer } from './dataLibrarySelectionSlice';
import { setDataLibraryAPIModeReducer } from './dataLibraryAPIModeSlice';

export const dataLibraryReducers = combineReducers({
  dataLibrarySelection: dataLibrarySelectionReducer,
  setDataLibraryAPIMode: setDataLibraryAPIModeReducer,
});
