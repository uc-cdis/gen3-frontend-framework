import {
  convertFilterSetToGqlFilter,
  fetchFencePresignedURL,
  type FilterSet,
  useSubmitSowerJobMutation,
  type CreateAndExportActionConfig,
  type JobBuilderAction,
  type SendJobOutputAction,
} from '@gen3/core';
import React, { forwardRef, ReactElement, useState } from 'react';
import { Button, ButtonProps } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { SowerJobsMonitor } from '../../../../services/SowerJobsMonitor';

const PRESIGNED_URL_TEMPLATE_VARIABLE = '{{PRESIGNED_URL}}';
interface SendPFBToURLParameters {
  targetURLTemplate: string;
  guid: string;
}

const isSendPFBToURLParameters = (
  value: unknown,
): value is SendPFBToURLParameters => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    'targetURLTemplate' in candidate &&
    typeof candidate.targetURLTemplate === 'string'
  );
};

export const sendPFBToURL: SendJobOutputAction = async ({
  parameters,
  onDone = () => null,
  onError = () => null,
  onAbort = () => null,
  signal = undefined,
}) => {
  if (!isSendPFBToURLParameters(parameters)) {
    onError(new Error('Invalid parameters for sendPFBToURL action'));
    return;
  }
  const { targetURLTemplate, guid } = parameters as SendPFBToURLParameters;

  // get the presigned URL for the selected PFB
  try {
    const presignedURL = await fetchFencePresignedURL({
      guid: guid,
      onAbort: onAbort,
      signal: signal,
    });
    // the PFB export target URL is a template URL that should have a {{PRESIGNED_URL}} template
    // variable in it.
    const signedURL = encodeURIComponent(presignedURL);
    const targetURL = targetURLTemplate.replace(
      PRESIGNED_URL_TEMPLATE_VARIABLE,
      signedURL,
    );
    return new Promise<void>(() => {
      if (window) window.open(targetURL, '_blank', 'noopener,noreferrer');
      if (onDone) onDone();
    });
  } catch (e: unknown) {
    return new Promise<void>(() => {
      onError(e as Error);
    });
  }
};

class SowerJobBuilderActionFactory {
  private static actions = new Map<string, JobBuilderAction>();

  static register(name: string, action: JobBuilderAction) {
    this.actions.set(name, action);
  }

  static getAction(name: string) {
    const action = this.actions.get(name);
    if (!action) {
      throw new Error(`Action ${name} not found`);
    }
    return action;
  }
}

class SendSowerJobOutputActionFactory {
  private static actions = new Map<string, SendJobOutputAction>();

  static register(name: string, action: SendJobOutputAction) {
    this.actions.set(name, action);
  }

  static getAction(name: string) {
    const action = this.actions.get(name);
    if (!action) {
      throw new Error(`Action ${name} not found`);
    }
    return action;
  }
}

interface BuildPFBFromCohortParams extends Record<string, unknown> {
  filter: FilterSet;
  index: string;
}

const buildPFBFromCohort: JobBuilderAction = (params) => {
  const { filter, index } = params as BuildPFBFromCohortParams;
  return {
    action: 'export-files',
    input: {
      filters: convertFilterSetToGqlFilter(filter),
      root_node: index,
    },
  };
};

SowerJobBuilderActionFactory.register(
  'export-cohort-to-pfb',
  buildPFBFromCohort,
);

SendSowerJobOutputActionFactory.register('handoff-pfb-to-url', sendPFBToURL);

export const bindCreateJobAction = (actionName: string): JobBuilderAction => {
  try {
    const createAction = SowerJobBuilderActionFactory.getAction(actionName);
    return createAction;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error binding action ${actionName}`, error.message);
    }
    throw error;
  }
};

export const bindSendResultsAction = (
  actionName: string,
): SendJobOutputAction => {
  try {
    const createAction = SendSowerJobOutputActionFactory.getAction(actionName);
    return createAction;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error binding action ${actionName}`, error.message);
    }
    throw error;
  }
};

interface CohortSubmitJobActionButtonProps {
  actions: CreateAndExportActionConfig;
  jobParameters: Record<string, any>;
  /**
   *   Left Icon for the button, can be undefined too
   */
  leftIcon?: ReactElement;
  /**
   *   Right Icon for the  button, can be undefined too (default to dropdown icon)
   */
  rightIcon?: ReactElement;
  /**
   *    only provide inactiveText if we want label for dropdown elements
   */
  inactiveText?: string;
  /**
   *    label to show when menu item's action is executing
   */
  activeText?: string;
  /**
   * custom test id
   */
  customDataTestId?: string;
  /**
   tooltip
   */
  tooltipText?: string;

  /**
   * aria-label for the button
   */
  buttonAriaLabel?: string;

  /**
   *    disables the target button and menu
   */
  disabled?: boolean;
}

const CohortSubmitJobActionButton = forwardRef<
  HTMLButtonElement,
  CohortSubmitJobActionButtonProps & ButtonProps
>(
  (
    {
      actions,
      jobParameters,
      tooltipText = undefined,
      disabled = false,
      ...props
    }: CohortSubmitJobActionButtonProps,
    ref,
  ) => {
    const [submitJob, { isLoading, isSuccess }] = useSubmitSowerJobMutation();

    // TODO: handle error from binding actions

    const handleSubmitJob = async () => {
      try {
        const createJobAction = bindCreateJobAction(
          actions.createAction.actionName,
        );
        const jobConfig = createJobAction({
          ...actions.createAction.parameters,
          ...jobParameters,
        });

        console.log('jobConfig', jobConfig);
        const { uid } = await submitJob(jobConfig).unwrap();

        // Register with global monitor
        SowerJobsMonitor.getInstance().registerJob(uid, actions);
      } catch (error: unknown) {
        notifications.show({
          title: 'Error',
          message: 'Failed to start job',
          color: 'red',
        });
      }
    };

    return (
      <Button
        ref={ref}
        loading={isLoading}
        onClick={handleSubmitJob}
        disabled={disabled}
        {...props}
      >
        Start Action
      </Button>
    );
  },
);

CohortSubmitJobActionButton.displayName = 'CohortSubmitJobActionButton';

export default CohortSubmitJobActionButton;
