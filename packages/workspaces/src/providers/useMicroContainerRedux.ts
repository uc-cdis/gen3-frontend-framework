import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useDoesHatcheryOptionExistsQuery,
  useLaunchHatcheryWorkspaceMutation,
  useTerminateHatcheryWorkspaceMutation,
} from '../core/hatcheryApi';
import {
  isFetchBaseQueryError,
  RequestedWorkspaceStatus,
  selectJEGActiveWorkspaceStatus,
  setJEGActiveWorkspaceId,
  setJEGActiveWorkspaceStatus,
  setJEGRequestedWorkspaceStatus,
  useCoreDispatch,
  useCoreSelector,
  WorkspaceStatus,
} from '@gen3/core';
import { useDeepCompareEffect } from 'use-deep-compare';
import { notifications } from '@mantine/notifications';
import { MicroContainerReduxContextValue } from './types';
import { getRTKQErrorMessage } from '../utils';

/**
 * Resolves an error message for a workspace-related operation.
 *
 * This function determines the error message to return based on the provided `error` object.
 * If the `error` object matches the criteria for a Fetch Base Query Error, the appropriate
 * RTK Query error message is returned. Otherwise, a default error message is used.
 *
 * @param {unknown} error - The error object encountered during the operation. Can be of any type.
 * @param {string} defaultMessage - The default message to use if the error does not match
 *                                  a Fetch Base Query Error.
 * @returns {string} The resolved error message, either derived from the specific error or the default message.
 */
const getWorkspaceErrorMessage = (
  error: unknown,
  defaultMessage: string,
): string => {
  if (isFetchBaseQueryError(error)) {
    return getRTKQErrorMessage(error);
  }
  return defaultMessage;
};

/**
 * Displays an error notification with the specified title and message.
 *
 * This function clears any existing notifications before showing a new
 * one. Notifications are displayed at the top-center of the screen.
 *
 * @param {string} title - The title of the error notification.
 * @param {string} message - The message content of the error notification.
 */
const showErrorNotification = (title: string, message: string) => {
  // Clear any existing notifications first
  notifications.clean(); // TODO debounce instead of clearing

  notifications.show({
    title,
    message,
    position: 'top-center',
  });
};

/**
 * Custom React hook that integrates with a micro-container system using Redux.
 * Enables launching and terminating containerized workspaces while managing state and errors.
 * Note must use the JEG versions of the redux actions.
 *
 * @param {string} tag - A unique identifier or tag for the container.
 * @param {boolean} enabled - A flag indicating whether the functionality is enabled.
 * @return {MicroContainerReduxContextValue} An object containing the workspace status, container hash,
 *                                           and functions to launch or terminate the workspace.
 *
 * @typedef {Object} MicroContainerReduxContextValue
 * @property {WorkspaceStatus} status - The current status of the workspace container (e.g., launching, running, terminating).
 * @property {string | null} containerHash - The unique hash of the container, or null if not yet set.
 * @property {Function} launch - Function to asynchronously launch the workspace container.
 * @property {Function} terminate - Function to asynchronously terminate the workspace container.
 */
export function useMicroContainerRedux(
  tag: string,
  enabled: boolean,
): MicroContainerReduxContextValue {
  const workspaceContainerStatus = useCoreSelector(
    selectJEGActiveWorkspaceStatus,
  );
  const [containerHash, setContainerHash] = useState<string | null>(null);
  const coreDispatch = useCoreDispatch();

  // get the options for the workspace could move to parent since
  const { data: optionData, error: optionsError } =
    useDoesHatcheryOptionExistsQuery(tag, { skip: containerHash !== null });

  const [
    launchTrigger,
    { isError: isWorkspaceLaunchError, error: workspaceLaunchError },
  ] = useLaunchHatcheryWorkspaceMutation();
  const [
    terminateWorkspace,
    { isError: isTerminateError, error: workspaceTerminateError },
  ] = useTerminateHatcheryWorkspaceMutation();

  useEffect(() => {
    if (optionData) setContainerHash(optionData);
  }, [optionData]);

  // handle errors in launching, getting status, or terminating
  useDeepCompareEffect(() => {
    if (isWorkspaceLaunchError || isTerminateError) {
      const errorMessage = getWorkspaceErrorMessage(
        isWorkspaceLaunchError ? workspaceLaunchError : workspaceTerminateError,
        isWorkspaceLaunchError
          ? 'Error launching workspace'
          : 'Error stopping workspace',
      );

      if (isWorkspaceLaunchError) {
        coreDispatch(setJEGActiveWorkspaceStatus(WorkspaceStatus.LaunchError));
      } else {
        coreDispatch(
          setJEGActiveWorkspaceStatus(WorkspaceStatus.TerminateError),
        );
      }
      coreDispatch(
        setJEGRequestedWorkspaceStatus(RequestedWorkspaceStatus.Unset),
      );
    }
  }, [isWorkspaceLaunchError, isTerminateError]);

  const launch = useCallback(async (): Promise<void> => {
    if (
      !enabled ||
      workspaceContainerStatus === WorkspaceStatus.Launching ||
      workspaceContainerStatus === WorkspaceStatus.Running
    )
      return;

    try {
      coreDispatch(setJEGActiveWorkspaceStatus(WorkspaceStatus.Launching));
      const query = containerHash ? encodeURIComponent(containerHash) : '';
      const launchResults = await launchTrigger(query).unwrap();
      if (!launchResults) {
        // launch error, will show error message and then reset
        coreDispatch(setJEGActiveWorkspaceStatus(WorkspaceStatus.LaunchError));
      } else {
        coreDispatch(setJEGActiveWorkspaceStatus(WorkspaceStatus.Running));
        coreDispatch(
          setJEGActiveWorkspaceId({ id: containerHash ?? 'default' }),
        );
      }
    } catch (_error: unknown) {
      coreDispatch(setJEGActiveWorkspaceStatus(WorkspaceStatus.LaunchError));
    }
    // Status will resolve to 'running' on the next poll
  }, [
    enabled,
    workspaceContainerStatus,
    coreDispatch,
    containerHash,
    launchTrigger,
  ]);

  const terminate = useCallback(async () => {
    if (!enabled || workspaceContainerStatus === WorkspaceStatus.Terminating)
      return;
    coreDispatch(setJEGActiveWorkspaceStatus(WorkspaceStatus.Running));
    const query = containerHash ? encodeURIComponent(containerHash) : '';
    try {
      const status = await terminateWorkspace(query).unwrap();
      coreDispatch(
        setJEGRequestedWorkspaceStatus(RequestedWorkspaceStatus.Terminate),
      );
      coreDispatch(setJEGActiveWorkspaceStatus(WorkspaceStatus.Terminating));
    } catch (_error: unknown) {
      coreDispatch(
        setJEGRequestedWorkspaceStatus(RequestedWorkspaceStatus.Terminate),
      );
      coreDispatch(setJEGActiveWorkspaceStatus(WorkspaceStatus.Terminating));
    }
  }, [containerHash, enabled, workspaceContainerStatus, terminateWorkspace]);

  return useMemo(
    () => ({
      status: workspaceContainerStatus,
      containerHash,
      launch,
      terminate,
    }),
    [workspaceContainerStatus, containerHash, launch, terminate],
  );
}
