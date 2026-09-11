import { combineReducers } from '@reduxjs/toolkit';
// import { persistReducer } from 'redux-persist';
// import sessionStorage from '../../storage-persist';
import { sowerApiReducer } from './sowerApi';

import { sowerJobsListReducer } from './sowerJobListSlice';

// const sowerJobDatetimePersistConfig = {
//   key: 'sowerJobDatetime',
//   version: 1,
//   storage: sessionStorage,
// };

export const sowerReducer = combineReducers({
  sowerApi: sowerApiReducer,
  sowerJobsList: sowerJobsListReducer,
});
