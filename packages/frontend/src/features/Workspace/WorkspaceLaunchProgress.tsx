import React, { useEffect, useState } from 'react';
import { Stepper, Button, Group, Text } from '@mantine/core';
import {
  LaunchStepIndicatorConfiguration,
  WorkspaceLaunchStatus,
} from './types';
import { useWorkspaceStatusContext } from './WorkspaceStatusProvider';
import { calculateLaunchSteps } from './calculateLaunchSteps';
import { useWorkspaceContext } from './WorkspaceProvider';

interface WorkspaceLaunchProgressProps {
  stepsConfig: LaunchStepIndicatorConfiguration;
  step?: WorkspaceLaunchStatus;
}

const WorkspaceStepper = ({
  stepsConfig,
  step,
}: WorkspaceLaunchProgressProps) => {
  if (!step) return null;

  console.log('step', step);
  return (
    <Stepper active={step.step} breakpoint="sm" allowNextStepsSelect={false}>
      {stepsConfig.steps.map((x, idx) => {
        return (
          <Stepper.Step
            key={x.label}
            label={x.label}
            description={x.description}
            color={step.status === 'error' ? 'red' : 'accent.4'}
          >
            {step.message && idx === step.step ? (
              <Text>{step.message}</Text>
            ) : null}
          </Stepper.Step>
        );
      })}
    </Stepper>
  );
};

const WorkspaceLaunchProgress = () => {
  const config = useWorkspaceContext();
  const { workspaceStatus } = useWorkspaceStatusContext();

  const step = calculateLaunchSteps(workspaceStatus);

  return (
    <WorkspaceStepper
      stepsConfig={config.launchStepIndicatorConfig}
      step={step}
    />
  );
};

export default WorkspaceLaunchProgress;
