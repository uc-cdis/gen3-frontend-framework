import {
  gen3ServicesReducer,
} from './features/gen3/gen3Api';
import { combineReducers } from '@reduxjs/toolkit';
import { userReducer } from './features/user/userSlice';
import { gen3AppReducer } from './features/gen3Apps/gen3AppsSlice';

export const rootReducer = combineReducers({
  gen3Services: gen3ServicesReducer,
  user: userReducer,
  gen3Apps: gen3AppReducer,
});

export type CoreState = ReturnType<typeof rootReducer>;
