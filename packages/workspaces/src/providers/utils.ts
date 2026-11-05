import { WorkspaceStatus } from '@gen3/core';
import { MicroContainerStatus } from './types';
import { HatcheryServiceState } from '../core/types';

export const hatcheryStateToMicroContainerStatus = (
  state: HatcheryServiceState,
): MicroContainerStatus => {
  switch (state) {
    case HatcheryServiceState.running:
      return 'running';
    case HatcheryServiceState.launching:
      return 'launching';
    case HatcheryServiceState.terminating:
      return 'terminating';
    case HatcheryServiceState.stopped:
      return 'not-running';
    case HatcheryServiceState.error:
      return 'error';
    case HatcheryServiceState.unknown:
    default:
      return 'unknown';
  }
};

export const hatcheryStateToWorkspaceStatus = (
  state: HatcheryServiceState,
): WorkspaceStatus => {
  switch (state) {
    case HatcheryServiceState.running:
      return WorkspaceStatus.Running;
    case HatcheryServiceState.launching:
      return WorkspaceStatus.Launching;
    case HatcheryServiceState.terminating:
      return WorkspaceStatus.Terminating;
    case HatcheryServiceState.stopped:
      return WorkspaceStatus.Stopped;
    case HatcheryServiceState.error:
      return WorkspaceStatus.Errored;
    case HatcheryServiceState.unknown:
      return WorkspaceStatus.NotFound;
    default:
      return WorkspaceStatus.NotFound;
  }
};
