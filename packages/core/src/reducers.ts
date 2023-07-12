import { mdsReducer, mdsReducerPath } from './features/metadata/metadataSlice';
import {
  gen3ServicesReducer,
  gen3ServicesReducerPath,
} from './features/gen3/gen3Api';
import { combineReducers } from '@reduxjs/toolkit';
import { userReducer } from './features/user/userSlice';
import { gen3AppReducer } from './features/gen3Apps/gen3AppsSlice';

export const rootReducer = combineReducers({
  [mdsReducerPath]: mdsReducer,
  [gen3ServicesReducerPath]: gen3ServicesReducer,
  user: userReducer,
  gen3Apps: gen3AppReducer,
});

export type CoreState = ReturnType<typeof rootReducer>;
