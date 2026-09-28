import {
  EmptyWorkspaceStatusResponse,
  selectPaymodelStatus,
  selectWorkspaceStatus,
  selectWorkspaceStatusFromService,
  useGetActivePayModelQuery,
  useGetWorkspaceOptionsQuery,
  useGetWorkspacePayModelsQuery,
  useGetWorkspaceStatusQuery,
  useLaunchWorkspaceMutation,
  useSetCurrentPayModelMutation,
  useTerminateWorkspaceMutation,
} from './workspaceApi';
import {
  clearActiveWorkspaceId,
  selectActiveWorkspaceId,
  selectActiveWorkspaceStatus,
  selectRequestedWorkspaceStatus,
  selectRequestedWorkspaceStatusTimestamp,
  setActiveWorkspace,
  setActiveWorkspaceId,
  setActiveWorkspaceStatus,
  setRequestedWorkspaceStatus,
} from './workspaceSlice';

import {
  clearJEGActiveWorkspaceId,
  selectJEGActiveWorkspaceId,
  selectJEGActiveWorkspaceStatus,
  selectJEGRequestedWorkspaceStatus,
  selectJEGRequestedWorkspaceStatusTimestamp,
  setJEGActiveWorkspace,
  setJEGActiveWorkspaceId,
  setJEGActiveWorkspaceStatus,
  setJEGRequestedWorkspaceStatus,
} from './jegWorkspaceSlice';

import {
  selectWorkspaceFullscreen,
  selectWorkspaceTier,
  setWorkspaceFullscreen,
  setWorkspaceTier,
} from './tieredWorkspaceSlice';

import {
  addJEGActiveKernel,
  clearJEGActiveKernels,
  removeJEGActiveKernel,
  removeManyJEGActiveKernels,
  updateJEGActionKernelStatus,
  upsertManyJEGActiveKernels,
} from './jegKernelSlice';

import {
  selectAllJEGKernels,
  selectJEGKernelById,
  selectJEGKernelIds,
} from './jegKernelSelector';

export * from './types';
export * from './utils';

export {
  EmptyWorkspaceStatusResponse,
  useGetWorkspaceOptionsQuery,
  useGetWorkspaceStatusQuery,
  useGetWorkspacePayModelsQuery,
  useGetActivePayModelQuery,
  useSetCurrentPayModelMutation,
  useLaunchWorkspaceMutation,
  useTerminateWorkspaceMutation,
  setActiveWorkspaceId,
  clearActiveWorkspaceId,
  setActiveWorkspaceStatus,
  setActiveWorkspace,
  setRequestedWorkspaceStatus,
  setWorkspaceTier,
  selectActiveWorkspaceId,
  selectActiveWorkspaceStatus,
  selectWorkspaceStatusFromService,
  selectRequestedWorkspaceStatus,
  selectWorkspaceStatus,
  selectRequestedWorkspaceStatusTimestamp,
  selectPaymodelStatus,
  selectWorkspaceTier,
  addJEGActiveKernel,
  upsertManyJEGActiveKernels,
  removeJEGActiveKernel,
  removeManyJEGActiveKernels,
  clearJEGActiveKernels,
  updateJEGActionKernelStatus,
  selectAllJEGKernels,
  selectJEGKernelById,
  selectJEGKernelIds,
  setJEGActiveWorkspaceId,
  clearJEGActiveWorkspaceId,
  setJEGActiveWorkspaceStatus,
  setJEGRequestedWorkspaceStatus,
  setJEGActiveWorkspace,
  selectJEGRequestedWorkspaceStatus,
  selectJEGActiveWorkspaceId,
  selectJEGActiveWorkspaceStatus,
  selectJEGRequestedWorkspaceStatusTimestamp,
  setWorkspaceFullscreen,
  selectWorkspaceFullscreen,
};
