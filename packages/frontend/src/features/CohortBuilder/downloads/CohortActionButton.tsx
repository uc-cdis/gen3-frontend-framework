import React, { useCallback } from 'react';
import useGuppyActionButton from './downloadActionHook';
import { GuppyActionButtonProps } from '../types';
import { Modals } from '@gen3/core';
import ActionButton from './ActionButton';

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
  const { handleClick, cancel, icon, active } = useGuppyActionButton({
    Modal403,
    Modal400,
    done,
    customErrorMessage,
    hideNotification,
    actionFunction,
    actionArgs,
  });

  const clickHandler = useCallback(() => {
    if (disabled) return;
    if (!active) void handleClick();
    else cancel();
  }, [active, disabled, handleClick, cancel]);

  return (
    <ActionButton
      activeText={activeText}
      inactiveText={inactiveText}
      active={active}
      icon={icon}
      handleClick={clickHandler}
      customStyle={customStyle}
      showLoading={showLoading}
      showIcon={showIcon}
      disabled={disabled}
      tooltipText={tooltipText}
    />
  );
};

export default React.memo(CohortActionButton);
