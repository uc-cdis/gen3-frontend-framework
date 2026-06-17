import { useEffect, useState } from 'react';
import {
  isTimeGreaterThan,
  RequestedWorkspaceStatus,
  selectJEGActiveWorkspaceStatus,
  selectJEGRequestedWorkspaceStatus,
  selectJEGRequestedWorkspaceStatusTimestamp,
  setJEGActiveWorkspaceStatus,
  setJEGRequestedWorkspaceStatus,
  useCoreDispatch,
  useCoreSelector,
  WorkspaceStatus,
} from '@gen3/core';
import { notifications } from '@mantine/notifications';
import { useDeepCompareEffect } from 'use-deep-compare';
import { convertSecondsToMilliseconds } from '@gen3/frontend';
import {
  useHatcheryStatusQuery,
  useTerminateHatcheryWorkspaceMutation,
} from '../core/hatcheryApi';
import { HatcheryServiceState } from '../core/types';
import { hatcheryStateToWorkspaceStatus } from './utils';
import { getRTKQErrorMessage } from '../utils';

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
  [WorkspaceStatus.Launching]: convertSecondsToMilliseconds(1),
  [WorkspaceStatus.Terminating]: convertSecondsToMilliseconds(1),
  [WorkspaceStatus.Running]: convertSecondsToMilliseconds(300),
  [WorkspaceStatus.Stopped]: convertSecondsToMilliseconds(5),
  [WorkspaceStatus.Errored]: convertSecondsToMilliseconds(10),
  [WorkspaceStatus.LaunchError]: convertSecondsToMilliseconds(10),
  [WorkspaceStatus.TerminateError]: convertSecondsToMilliseconds(10),
  [WorkspaceStatus.StatusError]: 0,
};

const workspaceShutdownAlertLimit = 30000; // 5 minutes: 5 * 60 * 1000 TODO Figure how to configure this

/**
 *  Monitors resource usage.
 *  Handles state changes and polls for workspace status using the JEG APIs
 */

export const useJEGWorkspaceResourceMonitor = (
  workspaceId: string | null = null,
  monitorWorkspace: boolean,
  monitorPayment: boolean = true, // Unused and vil go to a separate monitor
) => {
  const [pollingInterval, setPollingInterval] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const {
    data: workspaceStatusData,
    isError: isWorkspaceStatusError,
    error: workspaceStatusError,
  } = useHatcheryStatusQuery(
    workspaceId,
    monitorWorkspace
      ? {
          pollingInterval: pollingInterval,
          refetchOnMountOrArgChange: 1800,
          refetchOnFocus: true,
        }
      : {
          skip: true,
        },
  );

  const [terminateWorkspace] = useTerminateHatcheryWorkspaceMutation();
  const activeStatus = useCoreSelector(selectJEGActiveWorkspaceStatus);
  const requestedStatus = useCoreSelector(selectJEGRequestedWorkspaceStatus); // trigger to start/stop workspaces
  const requestedStatusTimestamp = useCoreSelector(
    selectJEGRequestedWorkspaceStatusTimestamp,
  );
  const dispatch = useCoreDispatch();
  const idleTimeLimit = workspaceStatusData?.idleTimeLimit;
  const lastActivityTime = workspaceStatusData?.lastActivityTime;

  useEffect(() => {
    if (isWorkspaceStatusError) {
      dispatch(setJEGActiveWorkspaceStatus(WorkspaceStatus.StatusError));
      setPollingInterval(0); // stop polling
      const errorMessage = getRTKQErrorMessage(workspaceStatusError);
      setError(errorMessage);
    }
  }, [isWorkspaceStatusError, dispatch, workspaceStatusError]);

  // update the polling based on the requested state
  useEffect(() => {
    if (requestedStatus === RequestedWorkspaceStatus.Launch) {
      setPollingInterval(WorkspacePollingInterval[WorkspaceStatus.Launching]);
    }
    if (requestedStatus === RequestedWorkspaceStatus.Terminate) {
      setPollingInterval(WorkspacePollingInterval[WorkspaceStatus.Terminating]);
    }
  }, [requestedStatus]);

  useDeepCompareEffect(() => {
    if (!workspaceStatusData) return;
    // LaunchError is set client-side by the launch() call and cleared by the
    // auto-reset timer in the panel.  Polling data must not override it or the
    // timer will be cancelled before it fires.
    if (activeStatus === WorkspaceStatus.LaunchError) return;
    const workspaceQueryStatus = hatcheryStateToWorkspaceStatus(
      workspaceStatusData?.status,
    );

    // Check if the workspace is running.
    // If so: need to check workspace idle if set
    // and ensure the pay model is queried
    if (workspaceStatusData.status === HatcheryServiceState.running) {
      //  const { idleTimeLimit, lastActivityTime } = workspaceStatusData;
      // in some state other than idle
      if (!idleTimeLimit || idleTimeLimit <= 0) {
        // Workspace is running, but no idle limit set.
        // Continue to poll to ensure we detect if it crashes or stops.
        dispatch(
          setJEGRequestedWorkspaceStatus(RequestedWorkspaceStatus.Unset),
        );
        dispatch(setJEGActiveWorkspaceStatus(WorkspaceStatus.Running)); // workspace is running
        setPollingInterval(WorkspacePollingInterval[WorkspaceStatus.Running]);
        return;
      }

      if (
        idleTimeLimit &&
        idleTimeLimit > 0 &&
        lastActivityTime &&
        lastActivityTime > 0
      ) {
        const remainingWorkspaceKernelLife =
          idleTimeLimit - (Date.now() - lastActivityTime);

        if (remainingWorkspaceKernelLife <= 0) {
          // kernel has died due to inactivity
          // so terminate
          (async () => {
            try {
              if (workspaceId) await terminateWorkspace(workspaceId).unwrap();
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
          })();
          dispatch(
            setJEGRequestedWorkspaceStatus(RequestedWorkspaceStatus.Terminate),
          );
          setPollingInterval(
            WorkspacePollingInterval[WorkspaceStatus.Terminating],
          );
          dispatch(setJEGActiveWorkspaceStatus(WorkspaceStatus.Terminating));
          notifyUser(
            'Workspace Shutdown',
            'Workspace has been idle for too long. Shutting workspace down',
            NotificationStatus.Error,
          );
          return;
        }
        if (remainingWorkspaceKernelLife <= workspaceShutdownAlertLimit) {
          setError('Workspace has been idle for too long. Will shutdown soon');
        }
      }

      if (requestedStatus === RequestedWorkspaceStatus.Launch) {
        // if we have a launch error then requested status has not been met
        if (workspaceQueryStatus === WorkspaceStatus.LaunchError) {
          dispatch(
            setJEGRequestedWorkspaceStatus(RequestedWorkspaceStatus.Unset),
          );
          dispatch(setJEGActiveWorkspaceStatus(WorkspaceStatus.NotFound));
          return;
        }
        // if the workspace is running then requested status has been met
        dispatch(
          setJEGRequestedWorkspaceStatus(RequestedWorkspaceStatus.Unset),
        );
      }
      if (requestedStatus === RequestedWorkspaceStatus.Terminate) {
        return;
      }

      dispatch(setJEGActiveWorkspaceStatus(workspaceQueryStatus));
      setPollingInterval(WorkspacePollingInterval[workspaceQueryStatus]);
      return;
    }

    if (workspaceStatusData.status === HatcheryServiceState.unknown) {
      // NotFound means pod is not running
      // either starting up
      // or finally terminated.
      if (requestedStatus === RequestedWorkspaceStatus.Launch) {
        // if the workspace becomes idle too long after a Launch request, switch to
        // Unset and NotFound.
        return;
      } else {
        // both requested status and workspace pod status are the same, so stop all polling
        setPollingInterval(WorkspacePollingInterval[WorkspaceStatus.NotFound]);
        dispatch(setJEGActiveWorkspaceStatus(WorkspaceStatus.NotFound));
        if (requestedStatus === RequestedWorkspaceStatus.Terminate) {
          // Cleanup termination after terminated
          dispatch(
            setJEGRequestedWorkspaceStatus(RequestedWorkspaceStatus.Unset),
          );
        }
      }
      return;
    }

    // if here, update active workspace status and polling interval
    dispatch(setJEGActiveWorkspaceStatus(workspaceQueryStatus));
    setPollingInterval(WorkspacePollingInterval[workspaceQueryStatus]);
  }, [dispatch, workspaceStatusData, requestedStatus, activeStatus]);

  useEffect(() => {
    if (
      requestedStatus === RequestedWorkspaceStatus.Launch &&
      isTimeGreaterThan(requestedStatusTimestamp, 5)
    ) {
      if (workspaceId) terminateWorkspace(workspaceId);
      dispatch(
        setJEGRequestedWorkspaceStatus(RequestedWorkspaceStatus.Terminate),
      );
      setError('Workspace failed to start. Shutting down');
    }
  }, [
    requestedStatus,
    requestedStatusTimestamp,
    terminateWorkspace,
    dispatch,
    workspaceStatusData,
    workspaceId,
  ]);
};
