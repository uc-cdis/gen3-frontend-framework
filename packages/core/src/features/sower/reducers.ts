import { combineReducers } from '@reduxjs/toolkit';
import { sowerApiReducer } from './sowerApi';
import { sowerJobsListReducer } from './sowerJobListSlice';

// The sower job list is user specific, so it is not persisted with redux-persist.
// See sowerJobsPersistence.ts, which stores it per user.
export const sowerReducer = combineReducers({
  sowerApi: sowerApiReducer,
  sowerJobsList: sowerJobsListReducer,
});
