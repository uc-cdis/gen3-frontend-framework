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
  name: 'JEGActiveWorkspace',
  initialState,
  reducers: {
    setJEGActiveWorkspaceId: (state, action: PayloadAction<WorkspaceId>) => {
      state = { ...state, id: action.payload.id };
      return state;
    },
    clearJEGActiveWorkspaceId: (state) => {
      return {
        ...state,
        id: NO_WORKSPACE_ID,
        status: WorkspaceStatus.NotFound,
      };
    },
    setJEGActiveWorkspaceStatus: (
      state,
      action: PayloadAction<WorkspaceStatus>,
    ) => {
      return {
        ...state,
        status: action.payload,
      };
    },
    setJEGRequestedWorkspaceStatus: (
      state,
      action: PayloadAction<RequestedWorkspaceStatus>,
    ) => {
      return {
        ...state,
        requestedStatus: action.payload,
        requestedStatusTimestamp: getCurrentTimestamp(),
      };
    },
    setJEGActiveWorkspace: (_state, action: PayloadAction<WorkspaceState>) => {
      return { ...action.payload };
    },
  },
});

export const jegActiveWorkspaceReducer = slice.reducer;
export const {
  setJEGActiveWorkspaceId,
  clearJEGActiveWorkspaceId,
  setJEGActiveWorkspaceStatus,
  setJEGRequestedWorkspaceStatus,
  setJEGActiveWorkspace,
} = slice.actions;

export const selectJEGActiveWorkspaceId = (state: CoreState): string =>
  state.jegActiveWorkspace.id;

export const selectJEGActiveWorkspaceStatus = (
  state: CoreState,
): WorkspaceStatus => state.jegActiveWorkspace.status;

export const selectJEGRequestedWorkspaceStatus = (
  state: CoreState,
): RequestedWorkspaceStatus => state.jegActiveWorkspace.requestedStatus;

export const selectJEGRequestedWorkspaceStatusTimestamp = (
  state: CoreState,
): number => state.jegActiveWorkspace.requestedStatusTimestamp;
