import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CoreState } from '../../reducers';
import {
  RequestedWorkspaceStatus,
  type WorkspaceId,
  WorkspaceStatus,
} from './types';
import { getCurrentTimestamp } from '../../utils/time';

export const NO_WORKSPACE_ID = 'none';

// the requested state for a workspace
export interface WorkspaceState {
  id: string;
  status: WorkspaceStatus; // current status of the workspace
  requestedStatus: RequestedWorkspaceStatus; // the goal state for the workspace
  requestedStatusTimestamp: number;
}

const initialState: WorkspaceState = {
  id: NO_WORKSPACE_ID,
  status: WorkspaceStatus.NotFound,
  requestedStatus: RequestedWorkspaceStatus.Unset,
  requestedStatusTimestamp: getCurrentTimestamp(),
};

const slice = createSlice({
  name: 'ActiveWorkspace',
  initialState,
  reducers: {
    setActiveWorkspaceId: (state, action: PayloadAction<WorkspaceId>) => {
      state = { ...state, id: action.payload.id };
      return state;
    },
    clearActiveWorkspaceId: (state) => {
      return { ...state, id: NO_WORKSPACE_ID };
    },
    setActiveWorkspaceStatus: (
      state,
      action: PayloadAction<WorkspaceStatus>,
    ) => {
      return { ...state, status: action.payload };
    },
    setRequestedWorkspaceStatus: (
      state,
      action: PayloadAction<RequestedWorkspaceStatus>,
    ) => {
      return {
        ...state,
        requestedStatus: action.payload,
        requestedStatusTimestamp: getCurrentTimestamp(),
      };
    },
    setActiveWorkspace: (_state, action: PayloadAction<WorkspaceState>) => {
      return { ...action.payload };
    },
  },
});

export const activeWorkspaceReducer = slice.reducer;
export const {
  setActiveWorkspaceId,
  clearActiveWorkspaceId,
  setActiveWorkspaceStatus,
  setRequestedWorkspaceStatus,
  setActiveWorkspace,
} = slice.actions;

export const selectActiveWorkspaceId = (state: CoreState): string =>
  state.activeWorkspace.id;

export const selectActiveWorkspaceStatus = (
  state: CoreState,
): WorkspaceStatus => state.activeWorkspace.status;

export const selectRequestedWorkspaceStatus = (
  state: CoreState,
): RequestedWorkspaceStatus => state.activeWorkspace.requestedStatus;

export const selectRequestedWorkspaceStatusTimestamp = (
  state: CoreState,
): number => state.activeWorkspace.requestedStatusTimestamp;
