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

export const workspaceKernelsSlice = createSlice({
  name: 'workspaceKernels',
  initialState: initialState,
  reducers: {
    addKernel: workspaceKernelsAdapter.addOne,
    removeKernel: workspaceKernelsAdapter.removeOne,
    clearKernels: workspaceKernelsAdapter.removeAll,
    updateKernelStatus: (
      state,
      action: PayloadAction<UpdateKernelStatusParams>,
    ) => {
      const { id, status } = action.payload;
      workspaceKernelsAdapter.updateOne(state, {
        id: id,
        changes: {
          lastActivity: Date.now(),
          executionState: status,
        },
      });
    },
  },
});

export const workspaceKernelReducer = workspaceKernelsSlice.reducer;

export const { addKernel, removeKernel, clearKernels, updateKernelStatus } =
  workspaceKernelsSlice.actions;

export const { selectAll: selectAllKernels, selectById: selectKernelById } =
  workspaceKernelsAdapter.getSelectors();
