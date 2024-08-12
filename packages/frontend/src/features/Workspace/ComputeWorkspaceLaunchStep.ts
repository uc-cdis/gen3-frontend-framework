import { Steps } from './types';
import { WorkspaceStatusResponse, PodConditionType } from '@gen3/core';

const PodConditionKeys = Object.keys(PodConditionType) as Array<
  keyof typeof PodConditionType
>;

const GetStepIndex = (status: PodConditionType) =>
  PodConditionKeys.indexOf(status);

interface WorkspaceLaunchStepsConfig {
  currentIndex: number;
  currentStepsStatus: string;
  steps: Array<{ title: string; description: string }>;
}

export const UpdateLaunchSteps = ({
  status,
  conditions,
  containerStates,
  workspaceType,
}: WorkspaceStatusResponse) => {
  // if status is not 'Launching', or 'Stopped',
  // or we don't have conditions array, don't display steps bar
  if (
    !conditions ||
    conditions.length === 0 ||
    (status !== 'Launching' && status !== 'Stopped')
  ) {
    return undefined;
  }

  // the return steps state
  const workspaceLaunchStepsConfig: WorkspaceLaunchStepsConfig = {
    currentIndex: 0,
    currentStepsStatus: 'process',
    steps: [
      { title: 'Scheduling Pod', description: '' },
      { title: 'Initializing Pod', description: '' },
      { title: 'Getting Containers Ready', description: '' },
      { title: 'Waiting for Proxy', description: '' },
    ],
  };

  return workspaceLaunchStepsConfig;
};
