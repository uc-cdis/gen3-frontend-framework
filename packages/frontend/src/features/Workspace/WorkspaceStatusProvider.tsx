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
  WorkspaceStatusResponse,
} from '@gen3/core';

interface WorkspaceStatusContextValue {
  isActive: boolean; // is a workspace in a non-idle state
  isConnected: boolean; // is it possible to connect to a running workspace
  startWorkspace: (id: string) => void;
  stopWorkspace: () => void;
  statusError?: boolean;
}
const WorkspaceStatusContext = createContext<WorkspaceStatusContextValue>({
  isActive: false,
  isConnected: false,
  startWorkspace: (id: string) => null,
  stopWorkspace: () => null,
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
  const [isActive, setActive] = useState<boolean>(false);
  const [isConnected, setConnected] = useState<boolean>(false);
  const { data: workspaceStatusData, isError: workspaceStatusRequestError } =
    useGetWorkspaceStatusQuery();

  const dispatch = useCoreDispatch();

  useEffect(() => {
    if (workspaceStatusData) {
      if (workspaceStatusData.status === WorkspaceStatus.NotFound) {
        setActive(false);
        dispatch(setActiveWorkspaceStatus(WorkspaceStatus.NotFound));
      } else if (workspaceStatusData.status === WorkspaceStatus.Terminating) {
      } else {
      }
    } else {
      setActive(false);
      dispatch(setActiveWorkspaceStatus(WorkspaceStatus.NotFound));
    }
  }, [workspaceStatusData]);

  const startWorkspace = (id: string) => {
    console.log('Starting workspace status', id);
  };

  const stopWorkspace = () => {
    console.log('Stopping workspace status');
  };

  const status = useMemo(() => {
    return {
      isActive,
      isConnected,
      startWorkspace,
      stopWorkspace,
      statusError: workspaceStatusRequestError ?? undefined,
    };
  }, [startWorkspace, stopWorkspace]);

  return (
    <WorkspaceStatusContext.Provider value={status}>
      {children}
    </WorkspaceStatusContext.Provider>
  );
};

export default WorkspaceStatusProvider;
