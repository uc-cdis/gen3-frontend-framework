import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CoreState } from '../../reducers';
import { type WorkspaceId, WorkspaceStatus } from './types';

export const NO_WORKSPACE_ID = 'none';

export interface WorkspaceState {
  id: string;
  status: WorkspaceStatus;
}

const initialState: WorkspaceState = {
  id: NO_WORKSPACE_ID,
  status: 'Not Found',
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
  },
});

export const activeWorkspaceReducer = slice.reducer;
export const {
  setActiveWorkspaceId,
  clearActiveWorkspaceId,
  setActiveWorkspaceStatus,
} = slice.actions;

export const selectActiveWorkspaceId = (state: CoreState): string =>
  state.activeWorkspace.id;

export const selectActiveWorkspaceStatus = (state: CoreState): string =>
  state.activeWorkspace.status;
