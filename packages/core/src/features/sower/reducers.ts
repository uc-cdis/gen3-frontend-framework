import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from '../../storage-persist';
import { GEN3_COMMONS_NAME } from '../../server';
import { sowerApiReducer } from './sowerApi';

import { sowerJobsListReducer } from './sowerJobListSlice';

// The root persist whitelist only matches top-level keys, and this slice lives at
// `state.sower.sowerJobsList`, so it is persisted here. Only the job list is
// whitelisted: the sowerApi RTK Query cache must not be persisted.
const sowerPersistConfig = {
  key: `${GEN3_COMMONS_NAME}-sower`,
  version: 1,
  storage,
  whitelist: ['sowerJobsList'],
};

export const sowerReducer = persistReducer(
  sowerPersistConfig,
  combineReducers({
    sowerApi: sowerApiReducer,
    sowerJobsList: sowerJobsListReducer,
  }),
);
