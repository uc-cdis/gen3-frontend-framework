// Import required dependencies
import { UpdateLaunchSteps } from '../ComputeWorkspaceLaunchStep';
import {
  PodConditionType,
  PodStatus,
  WorkspaceContainerState,
  WorkspacePodCondition,
} from '@gen3/core';

// Test suite for UpdateLaunchSteps
describe('UpdateLaunchSteps', () => {
  // This test focuses on updating launch step when required conditions are satisfied, Workspace Type is ECS and status is 'Launching'
  it('should update workspace launch status when status is Launching and workspaceType is ECS', () => {
    const conditions: WorkspacePodCondition[] = [
      { status: PodStatus.True, type: PodConditionType.Initialized },
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

    const result = UpdateLaunchSteps({
      status: 'Launching',
      conditions: conditions,
      containerStates: containerStates,
      workspaceType: 'ECS',
    });
    expect(result).toEqual({ step: 2, status: 'processing' });
  });

  // This test focuses on updating launch step when required conditions are satisfied, Workspace Type is not 'ECS' and none of the containers is in terminated state
  it('should process container states and update launch status when WorkspaceType is not ECS', () => {
    const conditions: WorkspacePodCondition[] = [
      { status: PodStatus.True, type: PodConditionType.Initialized },
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

    const result = UpdateLaunchSteps({
      status: 'Launching',
      conditions: conditions,
      containerStates: containerStates,
    });
    expect(result).toEqual({
      step: 2,
      status: 'processing',
      subSteps: [
        { title: 'container1', description: 'true' },
        { title: 'container2', description: 'true' },
      ],
    });
  });

  // This test focuses on confirming a proxy connection and updating the related status message
  it('should confirm proxy connection and update status message', () => {
    const conditions: WorkspacePodCondition[] = [
      { status: PodStatus.True, type: PodConditionType.Initialized },
      { status: PodStatus.True, type: PodConditionType.ContainersReady },
      { status: PodStatus.True, type: PodConditionType.PodScheduled },
      { status: PodStatus.True, type: PodConditionType.ProxyConnected },
    ];
    const result = UpdateLaunchSteps({
      status: 'Launching',
      conditions: conditions,
    });
    expect(result).toEqual({
      step: 4,
      status: 'processing',
      message: 'Proxy is ready',
    });
  });
});
