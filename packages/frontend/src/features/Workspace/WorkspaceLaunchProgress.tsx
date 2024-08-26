import React from 'react';
import { Stepper, Center, Text, Transition } from '@mantine/core';
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
  //  if (!step) return null;
  //  console.log('step', step);

  return (
    <Transition
      mounted={step !== undefined}
      transition="fade"
      duration={1200}
      exitDuration={1200}
      timingFunction="ease"
    >
      {(styles) => (
        <div className="p-2 mt-2 w-full" style={styles}>
          {!step ? null : (
            <Stepper active={step?.step} allowNextStepsSelect={false}>
              {stepsConfig.steps.map((x, idx) => {
                return (
                  <Stepper.Step
                    key={x.label}
                    label={x.label}
                    description={x.description}
                    color={step.status === 'error' ? 'red' : 'accent.4'}
                  >
                    {step.message ? (
                      <Center>
                        <Text>{step.message}</Text>
                      </Center>
                    ) : null}
                  </Stepper.Step>
                );
              })}
            </Stepper>
          )}
        </div>
      )}
    </Transition>
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
