import { gen3ServicesReducer } from './features/gen3/gen3Api';
import { combineReducers } from '@reduxjs/toolkit';
import { userReducer } from './features/user/userSlice';
import { gen3AppReducer } from './features/gen3Apps/gen3AppsSlice';
import { drsHostnamesReducer } from './features/drsResolver';
import { modalReducer } from './features/modals/modalsSlice';
import { cohortReducer } from './features/cohort';

import {
  guppyApiReducer,
  guppyApiSliceReducerPath,
} from './features/guppy/guppylApi';

export const rootReducer = combineReducers({
  gen3Services: gen3ServicesReducer,
  user: userReducer,
  gen3Apps: gen3AppReducer,
  drsHostnames: drsHostnamesReducer,
  modals: modalReducer,
  cohorts: cohortReducer,
  [guppyApiSliceReducerPath]: guppyApiReducer,
});

export type CoreState = ReturnType<typeof rootReducer>;
