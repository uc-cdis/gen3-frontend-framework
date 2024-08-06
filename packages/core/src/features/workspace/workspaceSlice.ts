import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CoreState } from '../../reducers';
import { type WorkspaceId } from './types';

export const NO_WORKSPACE_ID = 'none';

export interface WorkspaceState {
  id: string;
}

const initialState: WorkspaceState = {
  id: NO_WORKSPACE_ID,
};

const slice = createSlice({
  name: 'ActiveWorkspace',
  initialState,
  reducers: {
    setActiveWorkspaceId: (state, action: PayloadAction<WorkspaceId>) => {
      state = { id: action.payload.id };
      return state;
    },
    clearActiveWorkspaceId: () => {
      return { id: NO_WORKSPACE_ID };
    },
  },
});

export const activeWorkspaceReducer = slice.reducer;
export const { setActiveWorkspaceId, clearActiveWorkspaceId } = slice.actions;

export const selectActiveWorkspaceId = (state: CoreState): string =>
  state.activeWorkspace.id;
