import { workspaceKernelsAdapter } from './jegKernelSlice';
import type { CoreState } from '../../reducers.ts';

export const {
  selectAll: selectAllJEGKernels,
  selectById: selectJEGKernelById,
  selectIds: selectJEGKernelIds,
} = workspaceKernelsAdapter.getSelectors(
  (state: CoreState) => state.workspaceKernels,
);
