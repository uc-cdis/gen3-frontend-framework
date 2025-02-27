import { useEffect, useState } from 'react';
import {
  RequestedWorkspaceStatus,
  selectRequestedWorkspaceStatus,
  setActiveWorkspaceStatus,
  setRequestedWorkspaceStatus,
  useCoreDispatch,
  useCoreSelector,
  useGetWorkspacePayModelsQuery,
  useGetWorkspaceStatusQuery,
  useTerminateWorkspaceMutation,
  WorkspaceStatus,
  isTimeGreaterThan,
  selectRequestedWorkspaceStatusTimestamp,
} from '@gen3/core';
import { notifications } from '@mantine/notifications';
import { useDeepCompareEffect } from 'use-deep-compare';
import { convertSecondsToMilliseconds } from '../../utils';

const WORKSPACE_SHUTDOWN_ALERT_LIMIT = 30000; // TODO add to config

enum NotificationStatus {
  Info,
  Warn,
  Error,
}

const notifyUser = (
  title: string,
  message: string,
  status = NotificationStatus.Info,
) => {
  const NotificationMap: Record<NotificationStatus, string> = {
    [NotificationStatus.Info]: 'utility.1',
    [NotificationStatus.Warn]: 'utility.2',
    [NotificationStatus.Error]: 'utility.4',
  };

  notifications.show({
    title,
    message,
    color: NotificationMap[status],
    position: 'top-center',
  });
};

// TODO: convert to seconds/minutes for readability
const WorkspacePollingInterval: Record<WorkspaceStatus, number> = {
  [WorkspaceStatus.NotFound]: 0,
  [WorkspaceStatus.Launching]: convertSecondsToMilliseconds(5),
  [WorkspaceStatus.Terminating]: convertSecondsToMilliseconds(5),
  [WorkspaceStatus.Running]: convertSecondsToMilliseconds(300),
  [WorkspaceStatus.Stopped]: convertSecondsToMilliseconds(5),
  [WorkspaceStatus.Errored]: convertSecondsToMilliseconds(10),
  [WorkspaceStatus.StatusError]: 0,
};

// TODO: convert to seconds/minutes for readability
const PaymentPollingInterval: Record<WorkspaceStatus, number> = {
  'Not Found': 0,
  Launching: convertSecondsToMilliseconds(120), // 2 minutes
  Terminating: 0,
  Running: convertSecondsToMilliseconds(900), // 15 minutes
  Stopped: 0,
  Errored: 0,
  'Status Error': 0,
};

const workspaceShutdownAlertLimit = 30000; // 5 minutes: 5 * 60 * 1000 TODO Figure how to configure this

/**
 *  Monitors resource usage.
 *  Currently, handles workspace, payment and idle status
 */

export const useWorkspaceResourceMonitor = (monitorWorkspace: boolean) => {
  const [pollingInterval, setPollingInterval] = useState<number>(0);
  const [paymentPollingInterval, setPaymentPollingInterval] =
    useState<number>(0);
  const {
    data: workspaceStatusData,
    isError: isWorkspaceStatusError,
    error: workspaceStatusError,
  } = useGetWorkspaceStatusQuery(undefined, monitorWorkspace ? {
    pollingInterval: pollingInterval,
    refetchOnMountOrArgChange: 1800,
    refetchOnFocus: true,
  } : {
    skip: true,
  });

  const {
    data: paymentModelData,
    isError: isPaymentModelError,
    error: paymentModelError,
  } = useGetWorkspacePayModelsQuery(undefined,  monitorWorkspace ?  {
    pollingInterval: paymentPollingInterval,
    refetchOnMountOrArgChange: true,
  } : { skip: true });
  const [terminateWorkspace] = useTerminateWorkspaceMutation();
  const requestedStatus = useCoreSelector(selectRequestedWorkspaceStatus); // trigger to start/stop workspaces
  const requestedStatusTimestamp = useCoreSelector(
    selectRequestedWorkspaceStatusTimestamp,
  ); // last time requested status changed
  const dispatch = useCoreDispatch();

  useEffect(() => {
    if (isWorkspaceStatusError) {
      dispatch(setActiveWorkspaceStatus(WorkspaceStatus.StatusError));
      setPollingInterval(0); // stop polling
      setPaymentPollingInterval(0);
    }
  }, [
    paymentModelData,
    isPaymentModelError,
    paymentModelError,
    isWorkspaceStatusError,
    workspaceStatusError,
    dispatch,
  ]);

  useEffect(() => {
    if (isPaymentModelError) {
      console.error('Payment model error: ', paymentModelError.toString());
    }
    if (paymentModelData?.noPayModel) {
      console.warn('No payment model defined');
    }
  }, [paymentModelData, isPaymentModelError, paymentModelError]);

  // update the polling based on the requested state
  useDeepCompareEffect(() => {
    if (requestedStatus === RequestedWorkspaceStatus.Launch) {
      setPollingInterval(WorkspacePollingInterval[WorkspaceStatus.Launching]);
    }
    if (requestedStatus === RequestedWorkspaceStatus.Terminate) {
      setPollingInterval(WorkspacePollingInterval[WorkspaceStatus.Terminating]);
    }
  }, [requestedStatus]);

  useDeepCompareEffect(() => {
    if (workspaceStatusData?.status) {
      setPaymentPollingInterval(
        PaymentPollingInterval[workspaceStatusData.status],
      );
    }
  }, [workspaceStatusData?.status]);

  useDeepCompareEffect(() => {
    if (!workspaceStatusData) return;

    // Check if workspace is running.
    // If so: need to check workspace idle if set
    // and ensure the paymodel is queried
    if (workspaceStatusData.status === WorkspaceStatus.Running) {
      const { idleTimeLimit, lastActivityTime } = workspaceStatusData;
      // in some state other than idle
      if (!idleTimeLimit || idleTimeLimit <= 0) {
        // Do not need to poll
        dispatch(setRequestedWorkspaceStatus(RequestedWorkspaceStatus.Unset));
        dispatch(setActiveWorkspaceStatus(WorkspaceStatus.Running)); // workspace is running
        setPollingInterval(0);
        return;
      }

      if (idleTimeLimit && idleTimeLimit > 0 && lastActivityTime > 0) {
        const remainingWorkspaceKernelLife =
          idleTimeLimit - (Date.now() - lastActivityTime);

        if (remainingWorkspaceKernelLife <= 0) {
          // kernel has died due to inactivity
          // so terminate
          try {
            terminateWorkspace().unwrap(); // Unwrap mutation response
          } catch (error) {
            const errorMessage =
              (error as Error).message || 'Unknown error occurred';
            console.error('Workspace termination failed: ', errorMessage);
            notifyUser(
              'Workspace Error',
              `Failed to terminate workspace: ${errorMessage}`,
              NotificationStatus.Error,
            );
          }

          dispatch(
            setRequestedWorkspaceStatus(RequestedWorkspaceStatus.Terminate),
          );
          setPollingInterval(
            WorkspacePollingInterval[WorkspaceStatus.Terminating],
          );
          dispatch(setActiveWorkspaceStatus(WorkspaceStatus.Terminating));
          notifyUser(
            'Workspace Shutdown',
            'Workspace has been idle for too long. Shutting workspace down',
            NotificationStatus.Error,
          );
          return;
        }
        if (remainingWorkspaceKernelLife <= workspaceShutdownAlertLimit) {
          notifyUser(
            'Workspace Warning',
            'Workspace has been idle for too long. Will shutdown soon',
            NotificationStatus.Warn,
          );
        }
      }

      if (requestedStatus === RequestedWorkspaceStatus.Launch) {
        // if the workspace is running then requested status has been met
        dispatch(setRequestedWorkspaceStatus(RequestedWorkspaceStatus.Unset));
      }
      if (requestedStatus === RequestedWorkspaceStatus.Terminate) {
        return;
      }

      dispatch(setActiveWorkspaceStatus(workspaceStatusData.status));
      setPollingInterval(WorkspacePollingInterval[workspaceStatusData.status]);
      return;
    }

    if (workspaceStatusData.status === WorkspaceStatus.NotFound) {
      // NotFound means pod is not running
      // either starting up
      // or finally terminated.
      if (requestedStatus === RequestedWorkspaceStatus.Launch) {
        // if the workspace become idle to too long after a Launch request switch to
        // Unset and NotFound.
        return;
      } else {
        // both requested status and workspace pod status are the same so stop all polling
        setPollingInterval(WorkspacePollingInterval[WorkspaceStatus.NotFound]);
        dispatch(setActiveWorkspaceStatus(WorkspaceStatus.NotFound));
        if (requestedStatus === RequestedWorkspaceStatus.Terminate) {
          // Clean up termination after terminated
          dispatch(setRequestedWorkspaceStatus(RequestedWorkspaceStatus.Unset));
        }
      }
      return;
    }

    // if here, update active workspace status and polling interval
    dispatch(setActiveWorkspaceStatus(workspaceStatusData.status));
    setPollingInterval(WorkspacePollingInterval[workspaceStatusData.status]);
  }, [dispatch, workspaceStatusData, requestedStatus]);

  if (
    requestedStatus === RequestedWorkspaceStatus.Launch &&
    isTimeGreaterThan(requestedStatusTimestamp, 8)
  ) {
    terminateWorkspace();
    dispatch(setRequestedWorkspaceStatus(RequestedWorkspaceStatus.Terminate));
    notifyUser(
      'Workspace Startup',
      'Workspace failed to start. Shutting down',
      NotificationStatus.Error,
    );
  }
};
