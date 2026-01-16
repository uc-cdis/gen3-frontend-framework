import { gen3ServicesReducer } from './features/gen3/gen3Api';
import { combineReducers } from '@reduxjs/toolkit';
import { userReducer } from './features/user/userSlice';
import { gen3AppReducer } from './features/gen3Apps/gen3AppsSlice';
import { drsHostnamesReducer } from './features/drsResolver';
import { modalReducer } from './features/modals/modalsSlice';
import { activeWorkspaceReducer } from './features/workspace/workspaceSlice';
import { cartReducer, cartReducerPath } from './features/cart';
import {
  guppyApiReducer,
  guppyApiSliceReducerPath,
} from './features/guppy/guppyApi'; // Do not shorten
import {
  userAuthApiReducer,
  userAuthApiReducerPath,
} from './features/user/userSliceRTK';
import { cohortReducers } from './features/cohort/reducers';
import { sowerJobsListSliceReducer } from './features/sower/jobsListSlice';

export const rootReducer = combineReducers({
  gen3Services: gen3ServicesReducer,
  user: userReducer,
  gen3Apps: gen3AppReducer,
  drsHostnames: drsHostnamesReducer,
  modals: modalReducer,
  cohorts: cohortReducers,
  activeWorkspace: activeWorkspaceReducer,
  sowerJobsList: sowerJobsListSliceReducer,
  [guppyApiSliceReducerPath]: guppyApiReducer,
  [userAuthApiReducerPath]: userAuthApiReducer,
  [cartReducerPath]: cartReducer,
});

export type CoreState = ReturnType<typeof rootReducer>;
