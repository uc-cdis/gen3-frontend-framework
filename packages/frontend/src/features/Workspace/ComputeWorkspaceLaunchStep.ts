import {
  PodConditionType,
  WorkspaceContainerState,
  WorkspaceStatusResponse,
  PodStatus,
  WorkspacePodCondition,
} from '@gen3/core';
import { WorkspaceLaunchStatus } from './types';

const PodConditionIndex: Record<keyof typeof PodConditionType, number> = {
  PodScheduled: 0,
  Initialized: 1,
  ContainersReady: 2,
  PodReadyToStartContainers: 2,
  ProxyConnected: 3,
  Ready: 4,
};

export const retrievePodConditionStatus = (
  conditionType: PodConditionType,
  conditions: Array<WorkspacePodCondition>,
): PodStatus => {
  const matchingCondition = conditions.find(
    (condition) => condition.type === conditionType,
  );
  if (!matchingCondition) return PodStatus.Unknown;
  return matchingCondition.status;
};

export const calculateCurrentStep = (
  conditions: Array<WorkspacePodCondition>,
): number => {
  let currentStep = 0;
  conditions.forEach((condition: WorkspacePodCondition) => {
    const idx =
      PodConditionIndex[condition.type as keyof typeof PodConditionType];
    if (condition.status === PodStatus.True)
      currentStep = Math.max(idx + 1, currentStep);
  });
  return currentStep;
};

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
  const workspaceLaunchStatus: WorkspaceLaunchStatus = {
    step: 0,
    status: 'not ready',
  };

  const currentStep = calculateCurrentStep(conditions);

  workspaceLaunchStatus.step = currentStep;
  workspaceLaunchStatus.status = status === 'Stopped' ? 'error' : 'processing';

  if (currentStep == 2) {
    // get container status

    if (workspaceType === 'ECS') {
      if (status === 'Launching') {
        workspaceLaunchStatus.status = 'processing';
      } else if (status !== 'Active') {
        workspaceLaunchStatus.status = 'error';
      }
    } else {
      const cs: Array<WorkspaceContainerState> = containerStates;
      // handle container stats
      if (
        cs.some(
          (element: WorkspaceContainerState) =>
            element.state && element.state.terminated,
        )
      ) {
        workspaceLaunchStatus.status = 'error';
      } else {
        // If container states are available, display detailed pod statuses
        workspaceLaunchStatus.subSteps = cs.map((c) => ({
          title: c.name,
          description: `${c.ready}`,
        }));
      }
    }
  }

  if (currentStep == 3) {
    // wait for proxy
    const podStatus = retrievePodConditionStatus(
      PodConditionType.ProxyConnected,
      conditions,
    );

    if (podStatus === PodStatus.False)
      workspaceLaunchStatus.message =
        'In progress. If you are stuck here for more than a few minutes, cancel launch and try again or contact user support.';
  }

  if (currentStep == 4) {
    const podStatus = retrievePodConditionStatus(
      PodConditionType.ProxyConnected,
      conditions,
    );
    if (podStatus === PodStatus.True)
      workspaceLaunchStatus.message = 'Proxy is ready';
    else workspaceLaunchStatus.status = 'error';
  }

  return workspaceLaunchStatus;
};
