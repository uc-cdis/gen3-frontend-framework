import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { KernelStatus } from './types';

type KernelId = string;

export const workspaceKernelsAdapter = createEntityAdapter<
  KernelStatus,
  KernelId
>({
  selectId: (kernel: KernelStatus) => kernel.id,
});

interface UpdateKernelStatusParams {
  id: KernelId;
  status: string;
}

const initialState = workspaceKernelsAdapter.getInitialState([]);

/**
 *  Handles the state of the active kernels in the workspace.
 */
export const workspaceKernelsSlice = createSlice({
  name: 'workspaceKernels',
  initialState: initialState,
  reducers: {
    addJEGActiveKernel: (
      state,
      action: PayloadAction<Omit<KernelStatus, 'lastUpdate'>>,
    ) => {
      workspaceKernelsAdapter.upsertOne(state, {
        ...action.payload,
        lastUpdate: Date.now(),
      });
    },
    upsertManyJEGActiveKernels: (
      state,
      action: PayloadAction<Omit<KernelStatus, 'lastUpdate'>[]>,
    ) => {
      const now = Date.now();
      for (const kernel of action.payload) {
        workspaceKernelsAdapter.upsertOne(state, {
          ...kernel,
          lastUpdate: now,
        });
      }
    },
    removeJEGActiveKernel: workspaceKernelsAdapter.removeOne,
    removeManyJEGActiveKernels: workspaceKernelsAdapter.removeMany,
    clearJEGActiveKernels: workspaceKernelsAdapter.removeAll,
    updateJEGActionKernelStatus: (
      state,
      action: PayloadAction<UpdateKernelStatusParams>,
    ) => {
      const { id, status } = action.payload;
      workspaceKernelsAdapter.updateOne(state, {
        id: id,
        changes: {
          lastUpdate: Date.now(),
          executionState: status,
        },
      });
    },
  },
});

export const workspaceKernelReducer = workspaceKernelsSlice.reducer;

export const {
  addJEGActiveKernel,
  upsertManyJEGActiveKernels,
  removeJEGActiveKernel,
  removeManyJEGActiveKernels,
  clearJEGActiveKernels,
  updateJEGActionKernelStatus,
} = workspaceKernelsSlice.actions;
