import React, {
  useState,
  useMemo,
  createContext,
  ReactNode,
  useEffect,
} from 'react';
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
  useCoreSelector,
  selectActiveWorkspaceStatus,
  isWorkspaceActive,
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
  //  workspaceStatus: WorkspaceStatusResponse;
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

const PollingInterval: Record<WorkspaceStatus, number | undefined> = {
  'Not Found': undefined,
  Launching: 5000,
  Terminating: 10000,
  Running: undefined,
  Stopped: 5000,
  Errored: 1000,
  'Status Error': undefined,
};

const WorkspaceStatusProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setActive] = useState<boolean>(false);
  const [isFullscreen, setFullscreen] = useState<boolean>(false);
  const [isConnected, setConnected] = useState<boolean>(false);
  // const [pollingInterval, setPollingInterval] = useState<number | undefined>(
  //   undefined,
  // );
  // const {
  //   data: workspaceStatusData,
  //   isError: workspaceStatusRequestError,
  //   refetch: refetchStatus,
  // } = useGetWorkspaceStatusQuery(undefined, {
  //   pollingInterval: pollingInterval,
  //   refetchOnFocus: true,
  // });

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

  // useEffect(() => {
  //   refetchStatus();
  // }, []);
  //
  // console.log('currentWorkspaceStatus', currentWorkspaceStatus);
  // console.log('workspaceStatusData', workspaceStatusData);
  // console.log(
  //   'isWorkspaceLaunchError',
  //   isWorkspaceLaunchError,
  //   workspaceLaunchError,
  // );
  // // update the cached status
  // useDeepCompareEffect(() => {
  //   if (
  //     workspaceStatusData &&
  //     !workspaceStatusRequestError &&
  //     workspaceStatusData.status !== WorkspaceStatus.NotFound
  //   ) {
  //     console.log(
  //       'status update',
  //       workspaceStatusData.status,
  //       ' polling:',
  //       PollingInterval[workspaceStatusData.status],
  //     );
  //     setActive(isWorkspaceActive(workspaceStatusData.status));
  //     dispatch(setActiveWorkspaceStatus(workspaceStatusData.status));
  //     setPollingInterval(PollingInterval[workspaceStatusData.status]);
  //   } else {
  //     // need to consider that if in launchState might get a number of NotFound status before Launching
  //     if (currentWorkspaceStatus !== WorkspaceStatus.Launching) {
  //       setActive(false);
  //       setPollingInterval(PollingInterval[WorkspaceStatus.NotFound]);
  //       dispatch(setActiveWorkspaceStatus(WorkspaceStatus.NotFound));
  //       refetchStatus();
  //     }
  //   }
  // }, [dispatch, workspaceStatusData, workspaceStatusRequestError]);

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
        setActiveWorkspace({ id: id, status: WorkspaceStatus.Launching }), // this will inform the ResourceMonitor
      );
      // setPollingInterval(PollingInterval[WorkspaceStatus.Launching]);
      // refetchStatus();
    };

    const toggleFullscreen = () => setFullscreen((bVal) => !bVal);

    const stopWorkspace = () => {
      terminateWorkspace();
      dispatch(setActiveWorkspaceStatus(WorkspaceStatus.Terminating)); // this will inform the ResourceMonitor
      // setPollingInterval(PollingInterval[WorkspaceStatus.Terminating]);
      // refetchStatus();
    };

    return {
      isActive,
      isConnected,
      isFullscreen,
      startWorkspace,
      stopWorkspace,
      toggleFullscreen,
      workspaceLaunchIsLoading:
        currentWorkspaceStatus === WorkspaceStatus.Launching,
      terminateIsLoading,
      //  statusError: workspaceStatusRequestError ?? undefined,
      //  workspaceStatus: workspaceStatusData ?? EmptyWorkspaceStatusResponse,
    };
  }, [
    dispatch,
    isActive,
    isConnected,
    isFullscreen,
    launchTrigger,
    terminateIsLoading,
    terminateWorkspace,
    //    currentWorkspaceStatus,
    //    workspaceStatusRequestError,
  ]);

  return (
    <WorkspaceStatusContext.Provider value={status}>
      {children}
    </WorkspaceStatusContext.Provider>
  );
};

export default WorkspaceStatusProvider;
