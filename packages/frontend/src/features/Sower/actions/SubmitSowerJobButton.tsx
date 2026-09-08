import type { ReactElement } from 'react';
import React, { forwardRef, useEffect } from 'react';
import type { ButtonProps } from '@mantine/core';
import { Button, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { CreateAndExportOutputConfig } from '@gen3/core';
import { useSubmitSowerJobMutation } from '@gen3/core';
import { buildSubmitSowerJob } from './sowerActions';
import useSowerJobEventBus from '../useSowerJobEventBus';

interface SubmitSowerJobButtonProps {
  parameters: CreateAndExportOutputConfig;
  /**
   * label of button
   */
  label: string;
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

const SubmitSowerJobButton = forwardRef<
  HTMLButtonElement,
  SubmitSowerJobButtonProps & ButtonProps
>(
  (
    {
      parameters,
      tooltipText = undefined,
      disabled = false,
      label = 'Submit',
      ...props
    }: SubmitSowerJobButtonProps,
    ref,
  ) => {
    const [submitJob, { data, isLoading, isSuccess, error, isError }] =
      useSubmitSowerJobMutation();

    useEffect(() => {
      if (isSuccess) {
        notifications.show({
          title: 'Job Submission',
          message: 'Job Submitted Successfully',
        });
      }
      if (isError) {
        notifications.show({
          title: 'Job Submission',
          message: 'Job Submission Failed',
        });
      }
    }, [isSuccess, isError]);

    const { update, on } = useSowerJobEventBus();
    useEffect(() => {
      if (data?.uid) {
        console.log('data', data);
        update(data.uid);
        on('SubmitSowerJobButton', [data?.uid], (uid) => {
          // oxlint-disable-next-line no-console
          console.log('uid', uid);
        });
      }
    }, [data, on, update]);

    const { createAction, outputAction } = parameters;

    const handleSubmitJob = async () => {
      const jobBody = buildSubmitSowerJob(
        createAction.actionName,
        createAction.parameters,
      ); // builds the job body for the sower job
      if (jobBody) {
        await submitJob(jobBody);
      } else {
        console.error('No job body provided');
      }

      //  const outputFunction = find(outputAction?.actionName);
    };

    return (
      <Tooltip label={tooltipText} disabled={!tooltipText}>
        <Button
          ref={ref}
          loading={isLoading}
          onClick={handleSubmitJob}
          disabled={disabled}
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
