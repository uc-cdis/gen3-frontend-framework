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
  PodConditionType,
} from '@gen3/core';

interface WorkspaceStatusContextValue {
  isActive: boolean; // is a workspace in a non-idle state
  isConnected: boolean; // is it possible to connect to a running workspace
  startWorkspace: (id: string) => void;
  stopWorkspace: () => void;
  statusError?: boolean;
  workspaceLaunchIsLoading: boolean;
  terminateIsLoading: boolean;
}
const WorkspaceStatusContext = createContext<WorkspaceStatusContextValue>({
  isActive: false,
  isConnected: false,
  startWorkspace: (id: string) => null,
  stopWorkspace: () => null,
  workspaceLaunchIsLoading: false,
  terminateIsLoading: false,
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
  const [workspaceState, setWorkspaceState] = useState<WorkspaceStatus>(
    WorkspaceStatus.NotFound,
  );
  const [isConnected, setConnected] = useState<boolean>(false);
  const { data: workspaceStatusData, isError: workspaceStatusRequestError } =
    useGetWorkspaceStatusQuery(undefined, {
      pollingInterval: isActive ? 1000 : undefined,
    });

  const [
    launchTrigger,
    {
      isLoading: workspaceLaunchIsLoading,
      //   data: workspaceResponse,
      //   error: workspaceLaunchError,
    },
    // This is the destructured mutation result
  ] = useLaunchWorkspaceMutation();

  const [
    terminateWorkspace,
    {
      isLoading: terminateIsLoading,
      //   data: terminateData,
      //   error: terminateError,
    },
  ] = useTerminateWorkspaceMutation();

  const dispatch = useCoreDispatch();

  useEffect(() => {
    if (workspaceStatusData) {
      if (workspaceStatusData.status === WorkspaceStatus.NotFound) {
        setActive(false);
        dispatch(setActiveWorkspaceStatus(WorkspaceStatus.NotFound));
      } else if (workspaceStatusData.status === WorkspaceStatus.Terminating) {
        dispatch(setActiveWorkspaceStatus(WorkspaceStatus.Terminating));
      } else {
        dispatch(setActiveWorkspaceStatus(WorkspaceStatus.Terminating));
      }
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
      setActive(true);
    };

    const stopWorkspace = () => {
      terminateWorkspace();
      dispatch(setActiveWorkspaceStatus(WorkspaceStatus.Terminating));
    };

    return {
      isActive,
      isConnected,
      startWorkspace,
      stopWorkspace,
      workspaceLaunchIsLoading,
      terminateIsLoading,
      statusError: workspaceStatusRequestError ?? undefined,
    };
  }, [
    dispatch,
    isActive,
    isConnected,
    launchTrigger,
    terminateIsLoading,
    terminateWorkspace,
    workspaceLaunchIsLoading,
    workspaceStatusRequestError,
  ]);

  return (
    <WorkspaceStatusContext.Provider value={status}>
      {children}
    </WorkspaceStatusContext.Provider>
  );
};

export default WorkspaceStatusProvider;
