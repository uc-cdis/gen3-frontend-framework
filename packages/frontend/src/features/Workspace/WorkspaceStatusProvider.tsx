import React, { useState, useMemo, createContext, ReactNode } from 'react';
import {
  WorkspaceStatus,
  useCoreDispatch,
  useLaunchWorkspaceMutation,
  setActiveWorkspace,
  useTerminateWorkspaceMutation,
  useCoreSelector,
  selectActiveWorkspaceStatus,
  setRequestedWorkspaceStatus,
  setActiveWorkspaceStatus,
  isFetchBaseQueryError,
} from '@gen3/core';
import { useDeepCompareEffect } from 'use-deep-compare';
import { notifications } from '@mantine/notifications';

const getWorkspaceErrorMessage = (
  error: unknown,
  defaultMessage: string,
): string => {
  if (isFetchBaseQueryError(error)) {
    return error.data as string;
  }

  return defaultMessage;
};

interface WorkspaceStatusContextValue {
  isFullscreen: boolean; // fullscreen mode
  startWorkspace: (id: string) => void;
  stopWorkspace: () => void;
  toggleFullscreen: () => void;
  statusError?: boolean;
  workspaceLaunchIsLoading: boolean;
  terminateIsLoading: boolean;
}
const WorkspaceStatusContext = createContext<WorkspaceStatusContextValue>({
  isFullscreen: false,
  startWorkspace: () => null,
  stopWorkspace: () => null,
  toggleFullscreen: () => null,
  workspaceLaunchIsLoading: false,
  terminateIsLoading: false,
  // workspaceStatus: EmptyWorkspaceStatusResponse,
});

export const useWorkspaceStatusContext = () => {
  const context = React.useContext(WorkspaceStatusContext);
  if (context === undefined) {
    throw Error(
      'Any workspace status component must be used inside of a useWorkspaceStatusContext',
    );
  }
  return context;
};

const WorkspaceStatusProvider = ({ children }: { children: ReactNode }) => {
  const [isFullscreen, setFullscreen] = useState<boolean>(false);

  const [
    launchTrigger,
    { isError: isWorkspaceLaunchError, error: workspaceLaunchError },
  ] = useLaunchWorkspaceMutation();

  const [
    terminateWorkspace,
    {
      isLoading: terminateIsLoading,
      isError: isTerminateError,
      error: workspaceTerminateError,
    },
  ] = useTerminateWorkspaceMutation();

  const dispatch = useCoreDispatch();

  const currentWorkspaceStatus = useCoreSelector(selectActiveWorkspaceStatus);

  // handle errors in launching, getting status, or terminating
  useDeepCompareEffect(() => {
    if (isWorkspaceLaunchError || isTerminateError) {
      notifications.show({
        title: 'Workspace Error',
        message: getWorkspaceErrorMessage(
          isWorkspaceLaunchError
            ? workspaceLaunchError
            : workspaceTerminateError,
          isWorkspaceLaunchError
            ? 'Error launching workspace'
            : 'Error stopping workspace',
        ),
        position: 'top-center',
        containerWidth: '50%',
      });
      dispatch(setRequestedWorkspaceStatus('NotSet'));
      dispatch(setActiveWorkspaceStatus(WorkspaceStatus.NotFound));
    }
  }, [isWorkspaceLaunchError, isTerminateError]);

  const status = useMemo(() => {
    const startWorkspace = (id: string) => {
      launchTrigger(id);
      dispatch(
        setActiveWorkspace({
          id: id,
          status: WorkspaceStatus.Launching,
          requestedStatus: 'Launching',
        }),
      );
    };

    const toggleFullscreen = () => setFullscreen((bVal) => !bVal);

    const stopWorkspace = () => {
      terminateWorkspace();
      dispatch(setRequestedWorkspaceStatus('Terminating'));
      dispatch(setActiveWorkspaceStatus(WorkspaceStatus.Terminating));
    };

    return {
      isFullscreen,
      startWorkspace,
      stopWorkspace,
      toggleFullscreen,
      workspaceLaunchIsLoading:
        currentWorkspaceStatus === WorkspaceStatus.Launching,
      terminateIsLoading,
    };
  }, [
    dispatch,
    isFullscreen,
    launchTrigger,
    terminateIsLoading,
    terminateWorkspace,
  ]);

  return (
    <WorkspaceStatusContext.Provider value={status}>
      {children}
    </WorkspaceStatusContext.Provider>
  );
};

export default WorkspaceStatusProvider;
