import React, { forwardRef, ReactElement, useCallback, useEffect } from 'react';
import { Button, ButtonProps, Text, Tooltip } from '@mantine/core';
import { useSubmitSowerJobMutation } from '@gen3/core';
import { ActionButtonWithArgsFunction } from '../types';

interface CohortSubmitJobActionButtonProps {
  actionFunction: ActionButtonWithArgsFunction;
  actionArgs: Record<string, any>;
  /**
   *    if true, doesn't set width to be "target"
   */
  disableTargetWidth?: string;
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
      actionFunction,
      actionArgs,
      tooltipText = undefined,
      disabled = false,
      ...props
    }: CohortSubmitJobActionButtonProps,
    ref,
  ) => {
    const [
      submitJob,
      {
        data,
        isLoading: isSubmitJobLoading,
        isError: isSubmitJobLoadingError,
        error: submittedJobError,
      },
    ] = useSubmitSowerJobMutation();
    const [isActive, setIsActive] = React.useState(false);
    const { size } = props as ButtonProps;

    const onSubmit = useCallback(() => {
      actionFunction({ dispatchJob: submitJob, ...actionArgs });
    }, [actionArgs, actionFunction, submitJob]);

    useEffect(() => {
      if (data) {
        console.log(data);
      }
    }, []);

    return (
      <Tooltip disabled={!tooltipText} label={tooltipText}>
        <Button ref={ref} disabled={disabled} {...props} onClick={onSubmit}>
          <Text fs={size} color={isActive ? 'red' : 'blue'}>
            {isActive ? 'Running' : 'Submit'}
          </Text>
          {/* You can add button content or children here */}
        </Button>
      </Tooltip>
    );
  },
);

CohortSubmitJobActionButton.displayName = 'CohortSubmitJobActionButton';

export default CohortSubmitJobActionButton;
