import {
  convertFilterSetToGqlFilter,
  fetchFencePresignedURL,
  type FilterSet,
  useSubmitSowerJobMutation,
  type CreateAndExportActionConfig,
  type BoundCreateAndExportAction,
  type JobBuilderAction,
  type SendJobOutputAction,
} from '@gen3/core';
import React, { forwardRef, ReactElement, useState } from 'react';
import { Button, ButtonProps } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import GlobalJobMonitor from '../../../../services/SowerJobsMonitor';

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
  action: string;
  filters: FilterSet;
  index: string;
}

const buildPFBFromCohort: JobBuilderAction = (params) => {
  const { action, filters, index } = params as BuildPFBFromCohortParams;
  return {
    action: action,
    input: {
      filters: convertFilterSetToGqlFilter(filters),
      root_node: index,
    },
  };
};

SowerJobBuilderActionFactory.register(
  'export-cohort-to-pfb',
  buildPFBFromCohort,
);

SendSowerJobOutputActionFactory.register('handoff-pfb-to-url', sendPFBToURL);

/**
 * A function that binds actions based on a given configuration.
 *
 * This function takes an object of type `ActionConfig` and returns an object of type `BoundActions`.
 * It uses factories to retrieve appropriate action functions, which are then incorporated into the
 * returned actions. The function handles any potential errors that occur during the action retrieval
 * process and logs an error message if an exception is caught.
 *
 * @param {ActionConfig} actionConfig - An object containing the configuration for the actions to be bound.
 * @returns {BoundActions} An object containing the result of binding actions according to the provided configuration.
 * @throws Will throw an error if there is an issue retrieving an action from the factory.
 */
const bindAction = (
  actionConfig: CreateAndExportActionConfig,
): BoundCreateAndExportAction => {
  try {
    const createAction = SowerJobBuilderActionFactory.getAction(
      actionConfig.createAction.actionName,
    );
    const sendAction = SendSowerJobOutputActionFactory.getAction(
      actionConfig.sendJobAction.actionName,
    );

    return {
      createAction: {
        ...actionConfig.createAction,
        actionFunction: createAction, // Make sure this is of type JobBuilderAction
      },
      sendJobAction: {
        ...actionConfig.sendJobAction,
        actionFunction: sendAction, // Make sure this is of type SendJobOutputAction
      },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error binding actions:', error.message);
    }
    throw error;
  }
};

interface CohortSubmitJobActionButtonProps {
  actions: CreateAndExportActionConfig;
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
  tooltip?: string;

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
      tooltip = undefined,
      disabled = false,
      ...props
    }: CohortSubmitJobActionButtonProps,
    ref,
  ) => {
    const [submitJob, { isLoading, isSuccess }] = useSubmitSowerJobMutation();

    // TODO: handle error from binding actions
    const boundActions = bindAction(actions);

    const handleSubmitJob = async () => {
      try {
        const jobConfig = boundActions.createAction.actionFunction(
          actions.createAction.parameters,
        );
        const { uid, status, name } = await submitJob(jobConfig).unwrap();

        // Register with global monitor
        GlobalJobMonitor.getInstance().registerJob(uid, boundActions);
      } catch (error: unknown) {
        notifications.show({
          title: 'Error',
          message: 'Failed to start job',
          color: 'red',
        });
      }
    };

    return (
      <Button loading={isLoading} onClick={handleSubmitJob} disabled={disabled}>
        Start Action
      </Button>
    );
  },
);

CohortSubmitJobActionButton.displayName = 'CohortSubmitJobActionButton';

export default CohortSubmitJobActionButton;
