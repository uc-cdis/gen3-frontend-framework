import type { ReactElement } from 'react';
import React, { forwardRef, useEffect } from 'react';
import type { ButtonProps } from '@mantine/core';
import { Button, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { CreateAndExportOutputConfig } from '@gen3/core';
import {
  isString,
  useIsUserLoggedIn,
  useSubmitSowerJobMutation,
} from '@gen3/core';
import { buildSubmitSowerJob } from './sowerActionUtils';
import { hasOutputAction } from './sowerActionFactory';

const DEFAULT_JOB_START_MESSAGE = 'Job Submitted Successfully';

interface SubmitSowerJobButtonProps {
  actions: CreateAndExportOutputConfig;
  /**
   * label of button
   */
  label: string;
  /**
   *   Left Icon for the button can be undefined too
   */
  leftIcon?: ReactElement;
  /**
   *   Right Icon for the button can be undefined too (default to dropdown icon)
   */
  rightIcon?: ReactElement;
  /**
   *    only provide inactiveText if we want a label for dropdown elements
   */
  inactiveText?: string;
  /**
   *    label to show when a menu item's action is executing
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
  /**
   * size of the button, matches Mantine.dev's ButtonProps.size
   */
  size?: ButtonProps['size'];
  /*
   * variant of maintine buttom
   */
  variant?: ButtonProps['variant'];
  /*
   * optional error handling function
   */
  onError?: () => void;
  /*
   * optional successful submission
   */
  onSuccess?: () => void;
}

const SubmitSowerJobButton = forwardRef<
  HTMLButtonElement,
  SubmitSowerJobButtonProps & ButtonProps
>(
  (
    {
      actions,
      label,
      tooltipText,
      disabled = false,
      onSuccess,
      onError,
      ...props
    }: SubmitSowerJobButtonProps,
    ref,
  ) => {
    const [submitJob, { isLoading, isSuccess, isError }] =
      useSubmitSowerJobMutation();

    const isLoggedIn = useIsUserLoggedIn();
    const buttonDisabled = disabled || !isLoggedIn;

    // parameters is Record<string, unknown>, so narrow before using as a message
    const startedMessage = actions.jobAction?.parameters?.jobStartedMessage;
    const jobStartedMessage = isString(startedMessage)
      ? startedMessage
      : DEFAULT_JOB_START_MESSAGE;

    useEffect(() => {
      if (isSuccess) {
        if (onSuccess) onSuccess();
        else
          notifications.show({
            title: 'Job Submission',
            message: jobStartedMessage,
          });
      }
      if (isError) {
        if (onError) onError();
        else
          notifications.show({
            title: 'Job Submission',
            message: 'Job Submission Failed',
          });
      }
    }, [isSuccess, isError, onError, onSuccess, jobStartedMessage]);

    const { jobAction, outputAction } = actions;

    const handleSubmitJob = async () => {
      const jobBody = buildSubmitSowerJob(jobAction.name, jobAction.parameters);
      if (!jobBody) {
        console.error(`No job body found for ${jobAction.name}`);
        return;
      }

      if (outputAction?.name && !hasOutputAction(outputAction?.name)) {
        console.warn(`No output function found for ${outputAction?.name}`);
      }

      // success/failure is reported via isSuccess/isError in the effect above
      await submitJob({
        name: label,
        dispatchJob: jobBody,
        outputAction: outputAction,
      });
    };

    return (
      <Tooltip label={tooltipText} disabled={!tooltipText}>
        <Button
          ref={ref}
          loading={isLoading}
          onClick={handleSubmitJob}
          disabled={buttonDisabled}
          {...props}
        >
          {label}
        </Button>
      </Tooltip>
    );
  },
);

SubmitSowerJobButton.displayName = 'SubmitSowerJobButton';

export default SubmitSowerJobButton;
