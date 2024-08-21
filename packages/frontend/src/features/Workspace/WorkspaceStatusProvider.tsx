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
} from '@gen3/core';

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

// const PollingInterval: Record<WorkspaceStatus, number > = {
//   'Not Found': 0,
//   Launching: 1000,
//   Terminating: 5000,
//   Running: 3000,
//   Stopped: 2000,
//   Errored: 0,
// };

const WorkspaceStatusProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setActive] = useState<boolean>(false);
  const [isFullscreen, setFullscreen] = useState<boolean>(false);
  const [isConnected, setConnected] = useState<boolean>(false);
  const { data: workspaceStatusData, isError: workspaceStatusRequestError } =
    useGetWorkspaceStatusQuery(undefined, {
      pollingInterval: isActive ? 1000 : undefined,
    });

  const toggleFullscreen = () => setFullscreen((bVal) => !bVal);

  const [
    launchTrigger,
    { isLoading: workspaceLaunchIsLoading, error: workspaceLaunchError },
    // This is the destructured mutation result
  ] = useLaunchWorkspaceMutation();

  const [
    terminateWorkspace,
    { isLoading: terminateIsLoading, error: terminateError },
  ] = useTerminateWorkspaceMutation();

  const dispatch = useCoreDispatch();

  // update the cached status
  useEffect(() => {
    if (workspaceStatusData) {
      setActive(isWorkspaceActive(workspaceStatusData.status));
      dispatch(setActiveWorkspaceStatus(workspaceStatusData.status));
    } else {
      setActive(false);
      dispatch(setActiveWorkspaceStatus(WorkspaceStatus.NotFound));
    }
  }, [dispatch, workspaceStatusData]);

  const status = useMemo(() => {
    const startWorkspace = (id: string) => {
      launchTrigger(id);
      dispatch(
        setActiveWorkspace({ id: id, status: WorkspaceStatus.Launching }),
      );
      setActive(true); // need to
    };

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
    toggleFullscreen,
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
