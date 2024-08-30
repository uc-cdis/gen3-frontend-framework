import React, { useState, useMemo, createContext, ReactNode } from 'react';
import {
  useGetWorkspaceStatusQuery,
  WorkspaceStatus,
  useCoreDispatch,
  setActiveWorkspaceStatus,
  useLaunchWorkspaceMutation,
  setActiveWorkspace,
  useTerminateWorkspaceMutation,
  WorkspaceStatusResponse,
  EmptyWorkspaceStatusResponse,
} from '@gen3/core';
import { useDeepCompareEffect } from 'use-deep-compare';
import { notifications } from '@mantine/notifications';

interface WorkspaceStatusContextValue {
  isActive: boolean; // is a workspace in a non-idle state
  isConnected: boolean; // is it possible to connect to a running workspace
  isFullscreen: boolean; // fullscreen mode
  startWorkspace: (id: string) => void;
  stopWorkspace: () => void;
  toggleFullscreen: () => void;
  statusError?: boolean;
  workspaceLaunchIsLoading: boolean;
  terminateIsLoading: boolean;
  workspaceStatus: WorkspaceStatusResponse;
}
const WorkspaceStatusContext = createContext<WorkspaceStatusContextValue>({
  isActive: false,
  isConnected: false,
  isFullscreen: false,
  startWorkspace: () => null,
  stopWorkspace: () => null,
  toggleFullscreen: () => null,
  workspaceLaunchIsLoading: false,
  terminateIsLoading: false,
  workspaceStatus: EmptyWorkspaceStatusResponse,
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

const isWorkspaceActive = (status: WorkspaceStatus) =>
  status === WorkspaceStatus.Running ||
  status === WorkspaceStatus.Launching ||
  status === WorkspaceStatus.Terminating;

const PollingInterval: Record<WorkspaceStatus, number | undefined> = {
  'Not Found': undefined,
  Launching: 1000,
  Terminating: 5000,
  Running: 20000,
  Stopped: 2000,
  Errored: 0,
};

const WorkspaceStatusProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setActive] = useState<boolean>(false);
  const [isFullscreen, setFullscreen] = useState<boolean>(false);
  const [isConnected, setConnected] = useState<boolean>(false);
  const [pollingInterval, setPollingInterval] = useState<number | undefined>(
    undefined,
  );
  const { data: workspaceStatusData, isError: workspaceStatusRequestError } =
    useGetWorkspaceStatusQuery(undefined, {
      pollingInterval: pollingInterval,
    });

  const [
    launchTrigger,
    {
      isLoading: workspaceLaunchIsLoading,
      isError: isWorkspaceLaunchError,
      error: workspaceLaunchError,
    },
    // This is the destructured mutation result
  ] = useLaunchWorkspaceMutation();

  const [
    terminateWorkspace,
    { isLoading: terminateIsLoading, error: terminateError },
  ] = useTerminateWorkspaceMutation();

  const dispatch = useCoreDispatch();

  console.log('workspaceStatusData', workspaceStatusData);
  console.log('workspaceLaunchError', isWorkspaceLaunchError);

  // update the cached status
  useDeepCompareEffect(() => {
    if (
      workspaceStatusData &&
      !workspaceStatusRequestError &&
      workspaceStatusData.status !== WorkspaceStatus.NotFound
    ) {
      setActive(isWorkspaceActive(workspaceStatusData.status));
      dispatch(setActiveWorkspaceStatus(workspaceStatusData.status));
      setPollingInterval(PollingInterval[workspaceStatusData.status]);
    } else {
      setActive(false);
      setPollingInterval(PollingInterval[WorkspaceStatus.NotFound]);
      dispatch(setActiveWorkspaceStatus(WorkspaceStatus.NotFound));
    }
  }, [dispatch, workspaceStatusData, workspaceStatusRequestError]);

  useDeepCompareEffect(() => {
    if (isWorkspaceLaunchError)
      notifications.show({
        title: 'Workspace Error',
        message: `Error launching workspace: ${workspaceLaunchError}`,
        position: 'top-center',
      });
  }, [workspaceLaunchError]);

  const status = useMemo(() => {
    const startWorkspace = (id: string) => {
      launchTrigger(id);
      dispatch(
        setActiveWorkspace({ id: id, status: WorkspaceStatus.Launching }),
      );
    };

    const toggleFullscreen = () => setFullscreen((bVal) => !bVal);

    const stopWorkspace = () => {
      terminateWorkspace();
      dispatch(setActiveWorkspaceStatus(WorkspaceStatus.Terminating));
    };

    return {
      isActive,
      isConnected,
      isFullscreen,
      startWorkspace,
      stopWorkspace,
      toggleFullscreen,
      workspaceLaunchIsLoading,
      terminateIsLoading,
      statusError: workspaceStatusRequestError ?? undefined,
      workspaceStatus: workspaceStatusData ?? EmptyWorkspaceStatusResponse,
    };
  }, [
    dispatch,
    isActive,
    isConnected,
    isFullscreen,
    launchTrigger,
    terminateIsLoading,
    terminateWorkspace,
    workspaceLaunchIsLoading,
    workspaceStatusData,
    workspaceStatusRequestError,
  ]);

  return (
    <WorkspaceStatusContext.Provider value={status}>
      {children}
    </WorkspaceStatusContext.Provider>
  );
};

export default WorkspaceStatusProvider;
