import {
  PodConditionType,
  WorkspaceContainerState,
  WorkspaceStatusResponse,
  PodStatus,
  WorkspacePodCondition,
  WorkspaceStatus,
} from '@gen3/core';
import { WorkspaceLaunchStatus } from './types';

const isTerminated = (state?: WorkspaceContainerState): boolean => {
  return state !== undefined && 'terminated' in state.state;
};

const PodConditionIndex: Record<keyof typeof PodConditionType, number> = {
  PodScheduled: 0,
  Initialized: 1,
  PodReadyToStartContainers: 2,
  ContainersReady: 3,
  ProxyConnected: 4,
  Ready: 5,
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
      currentStep = Math.max(idx + 1, currentStep); // Add +1 since if True this
  });
  return currentStep;
};

export const calculateLaunchSteps = ({
  status,
  conditions,
  containerStates,
  workspaceType,
}: Omit<WorkspaceStatusResponse, 'idleTimeLimit' | 'lastActivityTime'>) => {
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

  if (status === WorkspaceStatus.Running)
    return {
      step: 5,
      status: 'running',
    };

  const currentStep = calculateCurrentStep(conditions);

  workspaceLaunchStatus.step = currentStep;
  workspaceLaunchStatus.status = status === 'Stopped' ? 'error' : 'processing';

  if (currentStep == 2) {
    //  PodReadyToStartContainers == False
    const cs: Array<WorkspaceContainerState> = containerStates ?? [];
    // handle container stats
    if (cs.some((element: WorkspaceContainerState) => isTerminated(element))) {
      workspaceLaunchStatus.status = 'error';
      workspaceLaunchStatus.message = 'Service is terminated';
    }
    workspaceLaunchStatus.message = 'Starting notebook services';
  }

  if (currentStep == 3) {
    //  ContainersReady == False
    // get container status

    if (workspaceType === 'ECS') {
      if (status === 'Launching') {
        workspaceLaunchStatus.status = 'processing';
      } else if (status !== 'Stopped') {
        workspaceLaunchStatus.status = 'error';
      }
    } else {
      const cs: Array<WorkspaceContainerState> = containerStates ?? [];
      // handle container stats
      if (
        cs.some((element: WorkspaceContainerState) => isTerminated(element))
      ) {
        workspaceLaunchStatus.status = 'error';
        workspaceLaunchStatus.message = 'Service is terminated';
      } else {
        // If container states are available, display detailed pod statuses
        workspaceLaunchStatus.subSteps = cs.map((c) => ({
          title: c.name,
          description: `${c.ready ? 'ready' : 'pending'}`,
        }));
      }
    }
    const podStatus = retrievePodConditionStatus(
      PodConditionType.ProxyConnected,
      conditions,
    );

    if (podStatus === PodStatus.False)
      workspaceLaunchStatus.message =
        'In progress. If you are stuck here for more than a few minutes, cancel launch and try again or contact user support.';
  }

  // wait for proxy

  if (currentStep == 4) {
    // ProxyConnect == False
    const podStatus = retrievePodConditionStatus(
      PodConditionType.ProxyConnected,
      conditions,
    );
    if (podStatus === PodStatus.True)
      workspaceLaunchStatus.message = 'Proxy is ready';
    else workspaceLaunchStatus.status = 'error';
  }

  if (currentStep == 5) {
    workspaceLaunchStatus.message = 'Proxy is ready';
    workspaceLaunchStatus.status = 'complete';
  }

  return workspaceLaunchStatus;
};
