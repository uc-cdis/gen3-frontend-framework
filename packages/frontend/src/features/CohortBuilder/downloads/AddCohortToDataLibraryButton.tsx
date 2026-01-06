import React, { useCallback } from 'react';
import { GuppyActionButtonProps } from '../types';
import { DataLibraryDataset, Modals, useDataLibrary } from '@gen3/core';
import ActionButton from './ActionButton';
import useGuppyActionButton from './downloadActionHook';

const AddCohortToDataLibraryButton = ({
  activeText,
  inactiveText,
  customStyle,
  showLoading = true,
  showIcon = true,
  disabled = false,
  Modal403 = Modals.NoAccessModal,
  Modal400 = Modals.GeneralErrorModal,
  tooltipText,
  customErrorMessage,
  hideNotification = false,
  actionFunction,
  actionArgs,
}: GuppyActionButtonProps) => {
  const { addListToDataLibrary, updateListInDataLibrary } = useDataLibrary();

  const completeDataset = useCallback((args: unknown) => {
    const datasets = args as Record<string, DataLibraryDataset>;
  }, []);

  const { handleClick, icon, active } = useGuppyActionButton({
    Modal403,
    Modal400,
    customErrorMessage,
    hideNotification,
    actionFunction,
    actionArgs,
    onCompleted: completeDataset,
  });

  return (
    <ActionButton
      handleClick={handleClick}
      showIcon={showIcon}
      disabled={disabled}
      tooltipText={tooltipText}
      activeText={activeText || 'Add to Data Library'}
      inactiveText={inactiveText || 'Add to Data Library'}
      active={active}
      icon={icon}
    />
  );
};

export default AddCohortToDataLibraryButton;
