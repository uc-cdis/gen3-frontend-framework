import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modals, showModal, useCoreDispatch } from '@gen3/core';
import { GuppyActionButtonProps } from '../types';
import { cleanNotifications, showNotification } from '@mantine/notifications';
import { DownloadNotification } from '../../../utils/download';
import { Loader } from '@mantine/core';
import { FiDownload } from 'react-icons/fi';
import { useDeepCompareCallback } from 'use-deep-compare';

const showErrorMessage = (error: Error) => {
  showNotification({
    message: error.message,
  });
};

interface GuppyDownloadActionHookProps extends Pick<
  GuppyActionButtonProps,
  | 'Modal403'
  | 'Modal400'
  | 'done'
  | 'customErrorMessage'
  | 'hideNotification'
  | 'actionFunction'
  | 'actionArgs'
> {
  setIsActive?: (active: boolean) => void;
  onCompleted?: (args?: unknown) => void;
}

/**
 * useGuppyActionButton is a custom hook that provides functionality for handling
 * asynchronous actions with error handling, notifications, and a loading state.
 *
 * @param {Object} config - Configuration options for the hook.
 * @param {React.Component} [config.Modal403=Modals.NoAccessModal] - The modal to display for 403 error scenarios.
 * @param {React.Component} [config.Modal400=Modals.GeneralErrorModal] - The modal to display for general 400 error scenarios.
 * @param {Function} [config.done] - Callback function to execute when an action is completed or canceled.
 * @param {string} [config.customErrorMessage] - Custom error message to override the default error message.
 * @param {boolean} [config.hideNotification=false] - Whether to hide notification during action execution.
 * @param {Function} config.actionFunction - The asynchronous function to execute.
 * @param {any} config.actionArgs - Arguments to be passed to the `actionFunction`.
 * @param {Function} [config.setIsActive] - Callback function to track active state changes.
 * @param {Function} [config.onCompleted] - Callback function to execute after the action completes successfully.
 *
 * @returns {Object} - Hook utilities.
 * @returns {Function} handleClick - Function that triggers the primary action when invoked.
 * @returns {Function} cancel - Function to cancel the in-progress action.
 * @returns {React.ReactNode} icon - The icon rendered based on the active state (loading or ready).
 * @returns {boolean} active - The current active/busy state of the hook.
 */
const useGuppyActionButton = ({
  Modal403 = Modals.NoAccessModal,
  Modal400 = Modals.GeneralErrorModal,
  done,
  customErrorMessage,
  hideNotification = false,
  actionFunction,
  actionArgs,
  setIsActive = (_: boolean) => null,
  onCompleted = () => null,
}: GuppyDownloadActionHookProps) => {
  const [active, setActive] = useState(false);
  const dispatch = useCoreDispatch();

  const controllerRef = useRef<AbortController | null>(null);

  const setBusy = useCallback(
    (isBusy: boolean) => {
      setActive(isBusy);
      setIsActive?.(isBusy);
      if (!isBusy) cleanNotifications();
    },
    [setIsActive],
  );

  const handleError = useDeepCompareCallback(
    (error: Error) => {
      const errorMessage: string = error.message;
      if (
        errorMessage === 'internal server error' ||
        errorMessage === undefined
      ) {
        dispatch(showModal({ modal: Modal400, message: errorMessage }));
        console.error(error);
      } else if (
        errorMessage ===
        'Your token is invalid or expired. Please get a new token.'
      ) {
        dispatch(showModal({ modal: Modal403, message: errorMessage }));
        console.error(error);
      } else {
        dispatch(
          showModal({
            modal: Modal400,
            message: customErrorMessage || errorMessage,
          }),
        );
        console.error(error);
      }
    },
    [Modal400, Modal403, customErrorMessage, dispatch],
  );

  const showDownloadNotification = useCallback(
    (controller: AbortController) => {
      showNotification({
        title: 'Downloading',
        message: <DownloadNotification />,
        closeButtonProps: { 'aria-label': 'Close notification' },
        autoClose: false,
      });
    },
    [hideNotification],
  );

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setBusy(false);
    done?.(); // optional: only keep this if "cancel implies done" is intended
  }, [done, setBusy]);

  useEffect(() => {
    // Abort if the component using this hook unmounts mid-request
    return () => controllerRef.current?.abort();
  }, []);

  const handleClick = useCallback(async () => {
    // Optional: prevent multiple concurrent requests
    if (active) return;

    const controller = new AbortController();
    controllerRef.current = controller;

    showDownloadNotification(controller);
    setBusy(true);

    try {
      await actionFunction(
        actionArgs,
        () => {
          controllerRef.current = null;
          setBusy(false);
        },
        (error) => {
          controllerRef.current = null;
          handleError(error);
          setBusy(false);
          showErrorMessage(error);
        },
        () => {
          controllerRef.current = null;
          setBusy(false);
        },
        controller.signal,
        onCompleted,
      );
    } finally {
      // In case actionFunction throws before it calls your callbacks
      controllerRef.current = null;
    }
  }, [
    active,
    actionArgs,
    actionFunction,
    handleError,
    onCompleted,
    setBusy,
    showDownloadNotification,
  ]);

  const icon = active ? (
    <Loader size="sm" className="p-1" />
  ) : (
    <FiDownload title="download" size={16} />
  );

  return {
    handleClick,
    cancel,
    icon,
    active,
  };
};

export default useGuppyActionButton;
