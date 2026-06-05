import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CoreState } from '../../reducers';
import { type WorkspaceId } from './types';

export const NO_WORKSPACE_ID = 'none';

// the requested state for a workspace
export interface TieredWorkspaceState {
  id: string;
  tier: string | null;
}

const initialState: TieredWorkspaceState = {
  id: NO_WORKSPACE_ID,
  tier: null,
};

const slice = createSlice({
  name: 'TieredWorkspace',
  initialState,
  reducers: {
    setTieredWorkspaceId: (state, action: PayloadAction<WorkspaceId>) => {
      state = { ...state, id: action.payload.id };
      return state;
    },
    clearTieredWorkspaceId: (state) => {
      return { ...state, id: NO_WORKSPACE_ID };
    },
    setWorkspaceTier: (state, action: PayloadAction<string | null>) => {
      return { ...state, tier: action.payload };
    },
  },
});

export const tieredWorkspaceReducer = slice.reducer;
export const {
  setTieredWorkspaceId,
  clearTieredWorkspaceId,
  setWorkspaceTier,
} = slice.actions;

export const selectTieredWorkspaceId = (state: CoreState): string =>
  state.tieredWorkspace.id;

export const selectWorkspaceTier = (state: CoreState): string | null =>
  state.tieredWorkspace.tier;
