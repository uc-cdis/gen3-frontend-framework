import React, { useRef } from 'react';
import useGuppyActionButton from './downloadActionHook';
import { Button, Tooltip } from '@mantine/core';
import { FiDownload } from 'react-icons/fi';
import { GuppyActionButtonProps } from '../types';
import { Modals } from '@gen3/core';

const CohortActionButton = ({
  activeText,
  inactiveText,
  customStyle,
  showLoading = true,
  showIcon = true,
  disabled = false,
  Modal403 = Modals.NoAccessModal,
  Modal400 = Modals.GeneralErrorModal,
  tooltipText,
  done,
  customErrorMessage,
  hideNotification = false,
  actionFunction,
  actionArgs,
}: GuppyActionButtonProps) => {
  const { handleClick, icon, active } = useGuppyActionButton({
    Modal403,
    Modal400,
    done,
    customErrorMessage,
    hideNotification,
    actionFunction,
    actionArgs,
  });

  const ref = useRef(null);
  return (
    <Tooltip disabled={!tooltipText} label={tooltipText}>
      <Button
        ref={ref}
        leftSection={showIcon && inactiveText && <FiDownload />}
        disabled={disabled}
        className={
          customStyle ||
          `text-base-lightest ${
            disabled ? 'bg-base' : 'bg-primary hover:bg-primary-darker'
          } `
        }
        loading={showLoading && active}
        onClick={handleClick}
      >
        {active ? activeText : inactiveText || icon}
      </Button>
    </Tooltip>
  );
};

export default CohortActionButton;
