import { Steps } from './types';
import { WorkspaceStatusResponse } from '@gen3/core';

export const UpdateLaunchSteps = (
  workspaceStatusData: WorkspaceStatusResponse,
) => {
  const steps: Steps = [
    { title: 'Scheduling Pod', description: '' },
    { title: 'Initializing Pod', description: '' },
    { title: 'Getting Containers Ready', description: '' },
    { title: 'Waiting for Proxy', description: '' },
  ];

  if (
    !(
      workspaceStatusData.status !== 'Launching' ||
      workspaceStatusData.status !== 'Stopped'
    ) ||
    !workspaceStatusData.conditions ||
    workspaceStatusData.conditions.length === 0
  ) {
    // if status is not 'Launching', or 'Stopped',
    // or we don't have conditions array, don't display steps bar
    return undefined;
  }
};
