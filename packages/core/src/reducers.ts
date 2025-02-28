import { gen3ServicesReducer } from './features/gen3/gen3Api';
import { combineReducers } from '@reduxjs/toolkit';
import { userReducer } from './features/user/userSlice';
import { gen3AppReducer } from './features/gen3Apps/gen3AppsSlice';
import { drsHostnamesReducer } from './features/drsResolver';
import { modalReducer } from './features/modals/modalsSlice';
import { dataLibrarySelectionReducer } from './features/dataLibrary';
import { activeWorkspaceReducer } from './features/workspace/workspaceSlice';
import { guppyApiReducer, guppyApiSliceReducerPath } from './features/guppy';
import {
  userAuthApiReducerPath,
  userAuthApiReducer,
} from './features/user/userSliceRTK';
import { cohortReducers } from './features/cohort/reducers';

export const rootReducer = combineReducers({
  gen3Services: gen3ServicesReducer,
  user: userReducer,
  gen3Apps: gen3AppReducer,
  drsHostnames: drsHostnamesReducer,
  modals: modalReducer,
  cohorts: cohortReducers,
  activeWorkspace: activeWorkspaceReducer,
  dataLibrarySelection: dataLibrarySelectionReducer,
  [guppyApiSliceReducerPath]: guppyApiReducer,
  [userAuthApiReducerPath]: userAuthApiReducer,
});

export type CoreState = ReturnType<typeof rootReducer>;
