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

const MAXIMUM_START_TIME_IN_MINUTES = 6;

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
  [WorkspaceStatus.Running]: convertSecondsToMilliseconds(60),
  [WorkspaceStatus.Stopped]: convertSecondsToMilliseconds(60),
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
) => {
  // start with default polling interval of 1 second
  const [pollingInterval, setPollingInterval] = useState<number>(
    convertSecondsToMilliseconds(1),
  );
  const [error, setError] = useState<string | null>(null);

  const {
    data: workspaceStatusData,
    isError: isWorkspaceStatusError,
    error: workspaceStatusError,
  } = useHatcheryStatusQuery(
    workspaceId,
    monitorWorkspace // && workspaceId // TODO check to see if this is needed
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
    // TODO: add better error logging
    if (error) {
      console.log('useJEGWorkspaceResourceMonitor', error);
    }
  }, [error]);

  useDeepCompareEffect(() => {
    // No status data means we are not polling
    if (!workspaceStatusData) return;
    // LaunchError is set client-side by the launch() call from useMicroContainerRedux and cleared by the
    // auto-reset timer in the panel.  Polling data must not override it or the
    // timer will be canceled before it fires.
    if (activeStatus === WorkspaceStatus.LaunchError) return;
    const workspaceQueryStatus = hatcheryStateToWorkspaceStatus(
      workspaceStatusData?.status,
    );

    // handle cases of unknown, running, terminating, or launching
    if (workspaceStatusData.status === HatcheryServiceState.unknown) {
      // check for unknown state
      // NotFound means pod is not running
      // either starting up
      // or finally terminated.
      if (requestedStatus === RequestedWorkspaceStatus.Launch) {
        // if the workspace becomes idle too long after a Launch request, switch to
        // Unset and NotFound.
        console.warn(
          "requested status is Launch, but workspace pod isn't running yet.",
        );
        return;
      }
      // both requested status and workspace pod status are the same, so stop all polling
      setPollingInterval(WorkspacePollingInterval[WorkspaceStatus.NotFound]);
      dispatch(setJEGActiveWorkspaceStatus(WorkspaceStatus.NotFound));
      if (requestedStatus === RequestedWorkspaceStatus.Terminate) {
        // Cleanup termination after terminated
        dispatch(
          setJEGRequestedWorkspaceStatus(RequestedWorkspaceStatus.Unset),
        );
      }
      return;
    }

    // Check if the workspace is running.
    // If so: need to check workspace idle if set
    if (workspaceStatusData.status === HatcheryServiceState.running) {
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

      // handle if idle time is defined
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
              if (workspaceId)
                await terminateWorkspace(
                  encodeURIComponent(workspaceId),
                ).unwrap();
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
    }

    // Stopped means the pod is in a failed state — auto-terminate it
    if (workspaceStatusData.status === HatcheryServiceState.stopped) {
      (async () => {
        try {
          if (workspaceId)
            await terminateWorkspace(encodeURIComponent(workspaceId)).unwrap();
        } catch (error) {
          const errorMessage =
            (error as Error).message || 'Unknown error occurred';
          console.error(
            'Workspace termination of stopped pod failed: ',
            errorMessage,
          );
          notifyUser(
            'Workspace Error',
            `Failed to terminate stopped workspace: ${errorMessage}`,
            NotificationStatus.Error,
          );
        }
      })();
      dispatch(
        setJEGRequestedWorkspaceStatus(RequestedWorkspaceStatus.Terminate),
      );
      dispatch(setJEGActiveWorkspaceStatus(WorkspaceStatus.Terminating));
      setPollingInterval(WorkspacePollingInterval[WorkspaceStatus.Terminating]);
      notifyUser(
        'Workspace Stopped',
        'Workspace entered a failed state and is being terminated',
        NotificationStatus.Error,
      );
      return;
    }

    if (requestedStatus === RequestedWorkspaceStatus.Launch) {
      // if we have a launch error then requested status has not been met
      if (workspaceQueryStatus === WorkspaceStatus.LaunchError) {
        dispatch(
          setJEGRequestedWorkspaceStatus(RequestedWorkspaceStatus.Unset),
        );
        dispatch(setJEGActiveWorkspaceStatus(WorkspaceStatus.LaunchError));
        return;
      }
      if (workspaceQueryStatus === WorkspaceStatus.NotFound) {
        return; // pod not yet created, keep waiting
      }
      if (workspaceQueryStatus === WorkspaceStatus.Running) {
        // workspace is running — requested status has been met
        dispatch(
          setJEGRequestedWorkspaceStatus(RequestedWorkspaceStatus.Unset),
        );
        dispatch(setJEGActiveWorkspaceStatus(WorkspaceStatus.Running));
        return;
      }
      // still launching — update active status but keep requestedStatus as Launch
      dispatch(setJEGActiveWorkspaceStatus(workspaceQueryStatus));
      return;
    }

    if (requestedStatus === RequestedWorkspaceStatus.Terminate) {
      return;
    }

    // if here, update active workspace status and polling for other states
    dispatch(setJEGActiveWorkspaceStatus(workspaceQueryStatus));
    setPollingInterval(WorkspacePollingInterval[workspaceQueryStatus]);
  }, [dispatch, workspaceStatusData, requestedStatus, activeStatus]);

  useEffect(() => {
    // time out if exceeding maximum start timee
    if (
      requestedStatus === RequestedWorkspaceStatus.Launch &&
      isTimeGreaterThan(requestedStatusTimestamp, MAXIMUM_START_TIME_IN_MINUTES)
    ) {
      if (workspaceId) terminateWorkspace(encodeURIComponent(workspaceId));
      dispatch(
        setJEGRequestedWorkspaceStatus(RequestedWorkspaceStatus.Terminate),
        // no need to set as it will get set above
      );
      setError('Workspace failed to start. Shutting down');
    }
  }, [
    requestedStatus,
    requestedStatusTimestamp,
    dispatch,
    workspaceStatusData,
    workspaceId,
    terminateWorkspace,
  ]);
};
