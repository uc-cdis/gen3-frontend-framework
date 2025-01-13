import React, { useState, useMemo, createContext, ReactNode } from 'react';
import {
  WorkspaceStatus,
  useCoreDispatch,
  useLaunchWorkspaceMutation,
  setActiveWorkspace,
  useTerminateWorkspaceMutation,
  useCoreSelector,
  useGetWorkspacePayModelsQuery,
  selectActiveWorkspaceStatus,
  setRequestedWorkspaceStatus,
  setActiveWorkspaceStatus,
  isFetchBaseQueryError,
} from '@gen3/core';
import { useDeepCompareEffect } from 'use-deep-compare';
import { notifications } from '@mantine/notifications';
import { useFullscreen } from '@mantine/hooks';

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
  isPayModelNeededToLaunch?: boolean;
}
const WorkspaceStatusContext = createContext<WorkspaceStatusContextValue>({
  isFullscreen: false,
  startWorkspace: () => null,
  stopWorkspace: () => null,
  toggleFullscreen: () => null,
  workspaceLaunchIsLoading: false,
  terminateIsLoading: false,
  isPayModelNeededToLaunch: undefined,
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
  const { toggle: switchScreenMode, fullscreen: isFullscreen } =
    useFullscreen();
  const [isPayModelNeededToLaunch, setIsPayModelNeededToLaunch] = useState<
    boolean | undefined
  >(undefined);

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

  const {
    data: payModels,
    isLoading: isPayModelLoading,
    isError: isPayModelError,
  } = useGetWorkspacePayModelsQuery();

  useDeepCompareEffect(() => {
    if (isPayModelError) {
      notifications.show({
        title: 'Pay Model Error',
        message: 'Unable to get Pay Model.',
      });
    }
    if (isPayModelLoading) {
      setIsPayModelNeededToLaunch(true);
    }
    if (payModels) {
      setIsPayModelNeededToLaunch(
        Object.keys(payModels).length > 0 && payModels.currentPayModel != null,
      );
    }
  }, [payModels]);

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

    const toggleFullscreen = () => switchScreenMode();

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
      isPayModelNeededToLaunch,
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
