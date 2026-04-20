import React, { forwardRef, ReactElement } from 'react';
import { Button, ButtonProps, Tooltip } from '@mantine/core';
import { useSubmitSowerJobMutation } from '@gen3/core';
import { buildSowerJob } from './sowerActions';

interface SubmitSowerJobButtonProps {
  parameters: Record<string, any>;
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
    const [submitJob, { isLoading, isSuccess, error, isError }] =
      useSubmitSowerJobMutation();

    const { action } = parameters;

    const handleSubmitJob = async () => {
      const jobBody = buildSowerJob(action, parameters);
      console.log('handleSubmitJob', jobBody);
      if (jobBody) {
        submitJob(jobBody);
      }
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
