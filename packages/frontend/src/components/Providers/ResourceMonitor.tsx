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
} from '@gen3/core';
import { notifications } from '@mantine/notifications';
import { useDeepCompareEffect } from 'use-deep-compare';

const WORKSPACE_SHUTDOWN_ALERT_LIMIT = 30000; // TODO add to config

// TODO: convert to seconds/minutes for readability
const WorkspacePollingInterval: Record<WorkspaceStatus, number> = {
  'Not Found': 0,
  Launching: 5000,
  Terminating: 5000,
  Running: 300000,
  Stopped: 5000,
  Errored: 10000,
  'Status Error': 0,
};

// TODO: convert to seconds/minutes for readability
const PaymentPollingInterval: Record<WorkspaceStatus, number> = {
  'Not Found': 0,
  Launching: 120000, // 2 minutes
  Terminating: 0,
  Running: 900000, // 15 minutes
  Stopped: 0,
  Errored: 0,
  'Status Error': 0,
};

const workspaceShutdownAlertLimit = 30000; // 5 minutes: 5 * 60 * 1000 TODO Figure how to configure this

/**
 *  Monitors resource usage.
 *  Currently, handles workspace, payment and idle status
 */

export const useWorkspaceResourceMonitor = () => {
  const [pollingInterval, setPollingInterval] = useState<number>(0);
  const [paymentPollingInterval, setPaymentPollingInterval] =
    useState<number>(0);
  const {
    data: workspaceStatusData,
    isError: isWorkspaceStatusError,
    error: workspaceStatusError,
  } = useGetWorkspaceStatusQuery(undefined, {
    pollingInterval: pollingInterval,
    refetchOnMountOrArgChange: 1800,
    refetchOnFocus: true,
  });

  const {
    data: paymentModelData,
    isError: isPaymentModelError,
    error: paymentModelError,
  } = useGetWorkspacePayModelsQuery(undefined, {
    pollingInterval: paymentPollingInterval,
    refetchOnMountOrArgChange: true,
  });
  const [terminateWorkspace] = useTerminateWorkspaceMutation();
  const requestedStatus = useCoreSelector(selectRequestedWorkspaceStatus); // trigger to start/stop workspaces
  const dispatch = useCoreDispatch();

  useEffect(() => {
    if (isWorkspaceStatusError) {
      console.error('Workspace model error: ', workspaceStatusError.toString());
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
          try {
            terminateWorkspace().unwrap(); // Unwrap mutation response
          } catch (error) {
            console.error('Workspace termination failed: ', error);
            notifications.show({
              title: 'Error',
              message: 'Failed to terminate workspace',
              color: 'red',
              position: 'top-center',
            });
          }
          dispatch(
            setRequestedWorkspaceStatus(RequestedWorkspaceStatus.Terminate),
          );
          setPollingInterval(
            WorkspacePollingInterval[WorkspaceStatus.Terminating],
          );
          dispatch(setActiveWorkspaceStatus(WorkspaceStatus.Terminating));
          notifications.show({
            title: 'Workspace Shutdown',
            message:
              'Workspace has been idle for too long. Shutting workspace down',
            position: 'top-center',
          });
          return;
        }
        if (remainingWorkspaceKernelLife <= workspaceShutdownAlertLimit) {
          notifications.show({
            title: 'Workspace Warning',
            message: 'Workspace has been idle for too long. Will shutdown soon',
            position: 'top-center',
          });
        }
      }
      if (requestedStatus === 'Launch') {
        // if the workspace is running then requested status has been met
        dispatch(setRequestedWorkspaceStatus(RequestedWorkspaceStatus.Unset));
      }
      if (requestedStatus === 'Terminate') {
        return;
      }

      dispatch(setActiveWorkspaceStatus(workspaceStatusData.status));
      setPollingInterval(WorkspacePollingInterval[workspaceStatusData.status]);
      return;
    }

    if (workspaceStatusData.status === WorkspaceStatus.NotFound) {
      console.log(
        'workspaceStatusData.status',
        workspaceStatusData.status,
        ' requested status',
        requestedStatus,
      );
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
      }
      return;
    }

    // if here, update active workspace status and polling interval
    dispatch(setActiveWorkspaceStatus(workspaceStatusData.status));
    setPollingInterval(WorkspacePollingInterval[workspaceStatusData.status]);
  }, [dispatch, workspaceStatusData, requestedStatus]);
};
