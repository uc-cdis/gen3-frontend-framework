import { useState } from 'react';
import {
  setActiveWorkspaceStatus,
  useCoreDispatch,
  useGetWorkspaceStatusQuery,
  useTerminateWorkspaceMutation,
  selectRequestedWorkspaceStatus,
  WorkspaceStatus,
  isWorkspaceActive,
  useCoreSelector,
  setRequestedWorkspaceStatus,
} from '@gen3/core';
import { notifications } from '@mantine/notifications';
import { useDeepCompareEffect } from 'use-deep-compare';

const WorkspacePollingInterval: Record<WorkspaceStatus, number> = {
  'Not Found': 0,
  Launching: 5000,
  Terminating: 5000,
  Running: 300000,
  Stopped: 5000,
  Errored: 10000,
  'Status Error': 0,
};

const workspaceShutdownAlertLimit = 30000; // 5 minutes: 5 * 60 * 1000 TODO Figure how to configure this

/**
 *  Monitors resource usage.
 *  Currently, handles workspace, payment and idle status
 */

export const useResourceMonitor = () => {
  const [pollingInterval, setPollingInterval] = useState<number>(0);
  const {
    data: workspaceStatusData,
    isError: isWorkspaceStatusError,
    isSuccess: isWorkspaceStatusSuccess,
    refetch,
  } = useGetWorkspaceStatusQuery(undefined, {
    pollingInterval: pollingInterval,
    refetchOnMountOrArgChange: 1800,
    refetchOnFocus: true,
  });

  const [terminateWorkspace] = useTerminateWorkspaceMutation();
  const requestedStatus = useCoreSelector(selectRequestedWorkspaceStatus);
  const dispatch = useCoreDispatch();

  useDeepCompareEffect(() => {
    if (requestedStatus === 'Launching') {
      setPollingInterval(WorkspacePollingInterval[WorkspaceStatus.Launching]);
      refetch();
    }
    if (requestedStatus === 'Terminating') {
      setPollingInterval(WorkspacePollingInterval[WorkspaceStatus.Terminating]);
    }
  }, [requestedStatus]);

  useDeepCompareEffect(() => {
    if (!workspaceStatusData) return;

    if (isWorkspaceStatusError) {
      dispatch(setActiveWorkspaceStatus(WorkspaceStatus.StatusError));
      setPollingInterval(0); // stop polling
    }

    if (workspaceStatusData.status === WorkspaceStatus.Running) {
      // in some state other than idle
      if (
        !workspaceStatusData.idleTimeLimit ||
        workspaceStatusData.idleTimeLimit < 0
      ) {
        // Do not need to poll
        dispatch(setActiveWorkspaceStatus(workspaceStatusData.status));
        setPollingInterval(0);
        return;
      }

      if (
        workspaceStatusData?.idleTimeLimit &&
        workspaceStatusData.idleTimeLimit > 0 &&
        workspaceStatusData.lastActivityTime > 0
      ) {
        const remainingWorkspaceKernelLife =
          workspaceStatusData.idleTimeLimit -
          (Date.now() - workspaceStatusData.lastActivityTime);
        if (remainingWorkspaceKernelLife <= 0) {
          // kernel has died due to inactivity
          terminateWorkspace();
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
          // TODO change running refresh to handle this
          notifications.show({
            title: 'Workspace Warning',
            message: 'Workspace has been idle for too long. Will shutdown soon',
            position: 'top-center',
          });
        }
      }
      if (requestedStatus === 'Launching') {
        dispatch(setRequestedWorkspaceStatus('NotSet'));
      }
      if (requestedStatus === 'Terminating') {
        refetch();
        return;
      }
      dispatch(setActiveWorkspaceStatus(workspaceStatusData.status));
      setPollingInterval(WorkspacePollingInterval[workspaceStatusData.status]);
      return;
    }
    if (workspaceStatusData.status === WorkspaceStatus.NotFound) {
      if (requestedStatus !== 'Launching') {
        // need to consider that if in launchState might get a number of NotFound status before Launching
        setPollingInterval(WorkspacePollingInterval[WorkspaceStatus.NotFound]);
        dispatch(setActiveWorkspaceStatus(WorkspaceStatus.NotFound));
      }
      if (requestedStatus === 'Terminating')
        dispatch(setRequestedWorkspaceStatus('NotSet'));

      return;
    }

    dispatch(setActiveWorkspaceStatus(workspaceStatusData.status));
    setPollingInterval(WorkspacePollingInterval[workspaceStatusData.status]);
  }, [dispatch, workspaceStatusData, isWorkspaceStatusError, requestedStatus]);
};
