import type { ReactElement } from 'react';
import React, { forwardRef, useEffect } from 'react';
import type { ButtonProps } from '@mantine/core';
import { Button, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { CreateAndExportOutputConfig } from '@gen3/core';
import { useSubmitSowerJobMutation } from '@gen3/core';
import { bindSowerOutputJob, buildSubmitSowerJob } from './sowerActions';
import { useSowerContext } from '../SowerContext';

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

    const { update, on } = useSowerContext();
    useEffect(() => {
      if (data?.uid) {
        update(data.uid);
        on('SubmitSowerJobButton', [data.uid], (_uid) => {
          // job completed — output action is handled by useJobOutputAction in SowerProvider
        });
      }
    }, [data, on, update]);

    const { jobAction, outputAction } = actions;

    const handleSubmitJob = async () => {
      const jobBody = buildSubmitSowerJob(jobAction.name, jobAction.parameters);
      if (!jobBody) {
        console.error('No job body provided');
        return;
      }

      const outputFunction = bindSowerOutputJob(outputAction?.name);
      if (outputAction && !outputFunction) {
        console.warn('No output function provided');
      }

      await submitJob({
        dispatchJob: jobBody,
        outputAction: outputFunction ?? undefined,
      }).unwrap();
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
