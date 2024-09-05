import React, {
  useState,
  useMemo,
  createContext,
  ReactNode,
  useEffect,
} from 'react';
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
} from '@gen3/core';
import { useDeepCompareEffect } from 'use-deep-compare';
import { notifications } from '@mantine/notifications';

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
    // This is the destructured mutation result
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
    if (isWorkspaceLaunchError) {
      notifications.show({
        title: 'Workspace Error',
        message: 'Error launching workspace.',
        position: 'top-center',
      });
    }
    if (isTerminateError) {
      notifications.show({
        title: 'Workspace Error',
        message: 'Error terminating workspace',
        position: 'top-center',
      });
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
        }), // this will inform the ResourceMonitor
      );
    };

    const toggleFullscreen = () => setFullscreen((bVal) => !bVal);

    const stopWorkspace = () => {
      terminateWorkspace();
      dispatch(setRequestedWorkspaceStatus('Terminating'));
      dispatch(setActiveWorkspaceStatus(WorkspaceStatus.Terminating));
      // this will inform the ResourceMonitor
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
