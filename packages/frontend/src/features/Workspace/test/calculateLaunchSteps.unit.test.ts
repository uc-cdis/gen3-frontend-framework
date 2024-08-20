// Import required dependencies
import { calculateLaunchSteps } from '../calculateLaunchSteps';
import {
  PodConditionType,
  PodStatus,
  WorkspaceContainerState,
  WorkspacePodCondition,
  WorkspaceStatus,
} from '@gen3/core';

// Test suite for UpdateLaunchSteps
describe('UpdateLaunchSteps', () => {
  // This test focuses on updating launch step when required conditions are satisfied, Workspace Type is ECS and status is 'Launching'
  it('should update workspace launch status when status is Launching and workspaceType is ECS', () => {
    const conditions: WorkspacePodCondition[] = [
      { status: PodStatus.True, type: PodConditionType.Initialized },
      {
        status: PodStatus.True,
        type: PodConditionType.PodReadyToStartContainers,
      },
      { status: PodStatus.False, type: PodConditionType.ContainersReady },
      { status: PodStatus.True, type: PodConditionType.PodScheduled },
      { status: PodStatus.False, type: PodConditionType.ProxyConnected },
    ];
    const containerStates: WorkspaceContainerState[] = [
      {
        name: 'container1',
        ready: true,
        state: { running: { startedAt: '2021-12-12T16:39:57Z' } },
      },
      {
        name: 'container2',
        ready: true,
        state: { waiting: { reason: 'PodInitializing' } },
      },
    ];

    const result = calculateLaunchSteps({
      status: WorkspaceStatus.Launching,
      conditions: conditions,
      containerStates: containerStates,
      workspaceType: 'ECS',
    });
    expect(result).toEqual({
      step: 3,
      status: 'processing',
      message:
        'In progress. If you are stuck here for more than a few minutes, cancel launch and try again or contact user support.',
    });
  });

  // This test focuses on updating launch step when required conditions are satisfied, Workspace Type is not 'ECS' and none of the containers is in terminated state
  it('should process container states and update launch status when WorkspaceType is not ECS', () => {
    const conditions: WorkspacePodCondition[] = [
      { status: PodStatus.True, type: PodConditionType.Initialized },
      {
        status: PodStatus.True,
        type: PodConditionType.PodReadyToStartContainers,
      },
      { status: PodStatus.False, type: PodConditionType.ContainersReady },
      { status: PodStatus.True, type: PodConditionType.PodScheduled },
      { status: PodStatus.False, type: PodConditionType.ProxyConnected },
    ];
    const containerStates: WorkspaceContainerState[] = [
      {
        name: 'container1',
        ready: true,
        state: { running: { startedAt: '2021-12-12T16:39:57Z' } },
      },
      {
        name: 'container2',
        ready: true,
        state: { waiting: { reason: 'PodInitializing' } },
      },
    ];

    const result = calculateLaunchSteps({
      status: WorkspaceStatus.Launching,
      conditions: conditions,
      containerStates: containerStates,
    });
    expect(result).toEqual({
      message:
        'In progress. If you are stuck here for more than a few minutes, cancel launch and try again or contact user support.',
      step: 3,
      status: 'processing',
      subSteps: [
        { title: 'container1', description: 'ready' },
        { title: 'container2', description: 'ready' },
      ],
    });
  });

  // This test focuses on confirming a proxy connection and updating the related status message
  it('should confirm proxy connection and update status message', () => {
    const conditions: WorkspacePodCondition[] = [
      { status: PodStatus.True, type: PodConditionType.Initialized },
      {
        status: PodStatus.True,
        type: PodConditionType.PodReadyToStartContainers,
      },
      { status: PodStatus.True, type: PodConditionType.ContainersReady },
      { status: PodStatus.True, type: PodConditionType.PodScheduled },
      { status: PodStatus.True, type: PodConditionType.ProxyConnected },
    ];
    const result = calculateLaunchSteps({
      status: WorkspaceStatus.Launching,
      conditions: conditions,
      containerStates: [],
    });
    expect(result).toEqual({
      message: 'Proxy is ready',
      status: 'complete',
      step: 5,
    });
  });
});
