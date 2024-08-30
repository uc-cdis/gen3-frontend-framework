import { WorkspaceStatus } from './types';

export const isWorkspaceActive = (status: WorkspaceStatus) =>
  status === WorkspaceStatus.Running ||
  status === WorkspaceStatus.Launching ||
  status === WorkspaceStatus.Terminating;
