import React from 'react';
import { Stepper, Center, Text, Transition } from '@mantine/core';
import {
  LaunchStepIndicatorConfiguration,
  WorkspaceLaunchStatus,
} from './types';
import { calculateLaunchSteps } from './calculateLaunchSteps';
import { useWorkspaceContext } from './WorkspaceProvider';
import {
  selectWorkspaceStatusFromService,
  useCoreSelector,
  useCoreStore,
} from '@gen3/core';

interface WorkspaceLaunchProgressProps {
  stepsConfig: LaunchStepIndicatorConfiguration;
  step?: WorkspaceLaunchStatus;
}

const WorkspaceStepper = ({
  stepsConfig,
  step,
}: WorkspaceLaunchProgressProps) => {
  console.log('step', step);

  return (
    <Transition
      mounted={step !== undefined}
      transition="fade"
      duration={1200}
      exitDuration={1200}
      timingFunction="ease"
    >
      {(styles) => (
        <div className="p-2 mt-2 w-full mx-8" style={styles}>
          {!step ? null : (
            <Stepper size="xs" active={step?.step} allowNextStepsSelect={false}>
              {stepsConfig.steps.map((x) => {
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

  const workspaceStatus = useCoreSelector(selectWorkspaceStatusFromService);
  const step = calculateLaunchSteps(workspaceStatus);

  return (
    <div className="px-2 py-1">
      <WorkspaceStepper
        stepsConfig={config.launchStepIndicatorConfig}
        step={step}
      />
    </div>
  );
};

export default WorkspaceLaunchProgress;
