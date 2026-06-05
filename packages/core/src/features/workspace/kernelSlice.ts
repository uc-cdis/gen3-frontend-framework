import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { KernelStatus } from './types';

type KernelId = string;

export const workspaceKernelsAdapter = createEntityAdapter<
  KernelStatus,
  KernelId
>({
  selectId: (kernel: KernelStatus) => kernel.id,
});

const initialState = workspaceKernelsAdapter.getInitialState([]);

export const workspaceKernelsSlice = createSlice({
  name: 'workspaceKernels',
  initialState: initialState,
  reducers: {
    addKernel: workspaceKernelsAdapter.addOne,
    removeKernel: workspaceKernelsAdapter.removeMany,
    clearKernels: workspaceKernelsAdapter.removeAll,
  },
});

export const workspaceKernelReducer = workspaceKernelsSlice.reducer;

export const { addKernel, removeKernel, clearKernels } =
  workspaceKernelsSlice.actions;

export const { selectAll: selectAllKernels, selectById: selectKernelById } =
  workspaceKernelsAdapter.getSelectors();
