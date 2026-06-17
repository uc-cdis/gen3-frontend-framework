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
  setActiveWorkspaceStatus,
  setJEGActiveWorkspaceId,
  setJEGActiveWorkspaceStatus,
  setRequestedWorkspaceStatus,
  useCoreDispatch,
  useCoreSelector,
  WorkspaceStatus,
} from '@gen3/core';
import { useDeepCompareEffect } from 'use-deep-compare';
import { notifications } from '@mantine/notifications';
import { MicroContainerReduxContextValue } from './types';
import { getRTKQErrorMessage } from '../utils';

const getWorkspaceErrorMessage = (
  error: unknown,
  defaultMessage: string,
): string => {
  if (isFetchBaseQueryError(error)) {
    return getRTKQErrorMessage(error);
  }
  return defaultMessage;
};

const showErrorNotification = (title: string, message: string) => {
  // Clear any existing notifications first
  notifications.clean(); // TODO debounce instead of clearing

  notifications.show({
    title,
    message,
    position: 'top-center',
  });
};

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

      showErrorNotification('Workspace Error', errorMessage);
      coreDispatch(setRequestedWorkspaceStatus(RequestedWorkspaceStatus.Unset));
      coreDispatch(setActiveWorkspaceStatus(WorkspaceStatus.NotFound));
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
        setRequestedWorkspaceStatus(RequestedWorkspaceStatus.Terminate),
      );
      coreDispatch(setActiveWorkspaceStatus(WorkspaceStatus.Terminating));
    } catch (_error: unknown) {
      coreDispatch(
        setRequestedWorkspaceStatus(RequestedWorkspaceStatus.Terminate),
      );
      coreDispatch(setActiveWorkspaceStatus(WorkspaceStatus.Terminating));
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
