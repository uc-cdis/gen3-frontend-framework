import { gen3ServicesReducer } from './features/gen3/gen3Api';
import { combineReducers } from '@reduxjs/toolkit';
import { userReducer } from './features/user/userSlice';
import { gen3AppReducer } from './features/gen3Apps/gen3AppsSlice';
import { drsHostnamesReducer } from './features/drsResolver';
import { modalReducer } from './features/modals/modalsSlice';
import { cohortReducer } from './features/cohort';

import {
  graphqlAPIReducer,
  graphqlAPISliceReducerPath,
} from './features/query/graphqlApi';

export const rootReducer = combineReducers({
  gen3Services: gen3ServicesReducer,
  user: userReducer,
  gen3Apps: gen3AppReducer,
  drsHostnames: drsHostnamesReducer,
  modals: modalReducer,
  cohorts: cohortReducer,
  [graphqlAPISliceReducerPath]: graphqlAPIReducer,
});

export type CoreState = ReturnType<typeof rootReducer>;
