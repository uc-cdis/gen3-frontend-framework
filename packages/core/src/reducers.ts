import { gen3ServicesReducer } from './features/gen3/gen3Api';
import { combineReducers } from '@reduxjs/toolkit';
import { userReducer } from './features/user/userSlice';
import { gen3AppReducer } from './features/gen3Apps/gen3AppsSlice';
import { drsHostnamesReducer } from './features/drsResolver';
import { modalReducer } from './features/modals/modalsSlice';
import { cohortReducer } from './features/cohort';
import {
  userAuthApiReducerPath,
  userAuthApiReducer,
} from './features/user/userSliceRTK';
import { activeWorkspaceReducer } from './features/workspace/workspaceSlice';
import { sowerJobsListSliceReducer } from './features/sower';

import {
  guppyApiReducer,
  guppyApiSliceReducerPath,
} from './features/guppy/guppyApi';

export const rootReducer = combineReducers({
  gen3Services: gen3ServicesReducer,
  user: userReducer,
  gen3Apps: gen3AppReducer,
  drsHostnames: drsHostnamesReducer,
  modals: modalReducer,
  cohorts: cohortReducer,
  activeWorkspace: activeWorkspaceReducer,
  sowerJobsList: sowerJobsListSliceReducer,
  [guppyApiSliceReducerPath]: guppyApiReducer,
  [userAuthApiReducerPath]: userAuthApiReducer,
});

export type CoreState = ReturnType<typeof rootReducer>;
