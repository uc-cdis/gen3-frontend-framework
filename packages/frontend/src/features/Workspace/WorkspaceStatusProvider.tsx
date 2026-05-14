import React, {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  getCurrentTimestamp,
  isFetchBaseQueryError,
  RequestedWorkspaceStatus,
  selectActiveWorkspaceStatus,
  setActiveWorkspace,
  setActiveWorkspaceStatus,
  setRequestedWorkspaceStatus,
  useCoreDispatch,
  useCoreSelector,
  useGetWorkspacePayModelsQuery,
  useLaunchWorkspaceMutation,
  useTerminateWorkspaceMutation,
  WorkspaceStatus,
} from '@gen3/core';
import { useDeepCompareEffect } from 'use-deep-compare';
import { notifications } from '@mantine/notifications';
import { useFullscreen } from '@mantine/hooks';
import { PayModelStatus } from './types';
import { useWorkspaceContext } from './WorkspaceProvider';

const getWorkspaceErrorMessage = (
  error: unknown,
  defaultMessage: string,
): string => {
  if (isFetchBaseQueryError(error)) {
    return error.data as string;
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

interface WorkspaceStatusContextValue {
  isFullscreen: boolean; // fullscreen mode
  startWorkspace: (id: string) => void;
  stopWorkspace: () => void;
  toggleFullscreen: () => void;
  statusError?: boolean;
  workspaceLaunchIsLoading: boolean;
  terminateIsLoading: boolean;
  payModelStatus: PayModelStatus;
}
const WorkspaceStatusContext = createContext<WorkspaceStatusContextValue>({
  isFullscreen: false,
  startWorkspace: () => null,
  stopWorkspace: () => null,
  toggleFullscreen: () => null,
  workspaceLaunchIsLoading: false,
  terminateIsLoading: false,
  payModelStatus: PayModelStatus.INVALID,
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
  const [payModelStatus, setPayModelStatus] = useState<PayModelStatus>(
    PayModelStatus.INVALID,
  );

  const { requirePayModel } = useWorkspaceContext();

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

  useEffect(() => {
    if (isPayModelLoading) {
      setPayModelStatus(PayModelStatus.GETTING);
    }
    if (isPayModelError && requirePayModel) {
      setPayModelStatus(PayModelStatus.ERROR);
      showErrorNotification('Payment Error', 'Unable to get payment model');
    } else if (!requirePayModel) setPayModelStatus(PayModelStatus.VALID);
  }, [isPayModelLoading, isPayModelError, payModelStatus, requirePayModel]);

  useEffect(() => {
    if (payModels) {
      const isPayModelAboveLimit =
        payModels.currentPayModel?.request_status === 'above limit';
      if (isPayModelAboveLimit) {
        setPayModelStatus(PayModelStatus.OVER_LIMIT);
        showErrorNotification(
          'Payment Error',
          'Selected pay model usage has exceeded its available funding. Please choose another pay model.',
        );
        return;
      }
      if (Object.keys(payModels).length === 0) {
        setPayModelStatus(PayModelStatus.NOT_REQUIRED);
        return;
      }
      if (Object.keys(payModels).length > 0) {
        if (payModels.currentPayModel != null)
          setPayModelStatus(PayModelStatus.VALID);
        else setPayModelStatus(PayModelStatus.NOT_SELECTED);
      }
    }
  }, [payModels]);

  const dispatch = useCoreDispatch();

  const currentWorkspaceStatus = useCoreSelector(selectActiveWorkspaceStatus);

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
      dispatch(setRequestedWorkspaceStatus(RequestedWorkspaceStatus.Unset));
      dispatch(setActiveWorkspaceStatus(WorkspaceStatus.NotFound));
    }
  }, [isWorkspaceLaunchError, isTerminateError]);

  const status = useMemo(() => {
    const startWorkspace = (id: string) => {
      launchTrigger(id);
      dispatch(setRequestedWorkspaceStatus(RequestedWorkspaceStatus.Launch));
      dispatch(
        setActiveWorkspace({
          id: id,
          status: WorkspaceStatus.Launching,
          requestedStatus: RequestedWorkspaceStatus.Launch,
          requestedStatusTimestamp: getCurrentTimestamp(),
        }),
      );
    };

    const toggleFullscreen = () => switchScreenMode();

    const stopWorkspace = () => {
      terminateWorkspace();
      dispatch(setRequestedWorkspaceStatus(RequestedWorkspaceStatus.Terminate));
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
      payModelStatus,
    };
  }, [
    currentWorkspaceStatus,
    dispatch,
    isFullscreen,
    launchTrigger,
    payModelStatus,
    switchScreenMode,
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
