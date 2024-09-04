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
  selectActiveWorkspaceStatus,
  setRequestedWorkspaceStatus,
} from '@gen3/core';
import { notifications } from '@mantine/notifications';
import { useDeepCompareEffect } from 'use-deep-compare';

const WorkspacePollingInterval: Record<WorkspaceStatus, number> = {
  'Not Found': 0,
  Launching: 1000,
  Terminating: 5000,
  Running: 10000,
  Stopped: 5000,
  Errored: 10000,
  'Status Error': 0,
};

/**
 *  Monitors resource usage.
 *  Currently, handles workspace payment and idle status
 */

export const useResourceMonitor = () => {
  const [pollingInterval, setPollingInterval] = useState<number>(0);
  const {
    data: workspaceStatusData,
    isError: isWorkspaceStatusError,
    isSuccess: isWorkspaceStatusSuccess,
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
    }
    if (requestedStatus === 'Terminating') {
      setPollingInterval(WorkspacePollingInterval[WorkspaceStatus.Terminating]);
    }
  }, [requestedStatus]);

  useDeepCompareEffect(() => {
    if (!workspaceStatusData) return;

    if (isWorkspaceStatusError) {
      console.log('Setting Error', workspaceStatusData, isWorkspaceStatusError);
      dispatch(setActiveWorkspaceStatus(WorkspaceStatus.StatusError));
      setPollingInterval(0); // stop polling
    }

    if (workspaceStatusData.status === WorkspaceStatus.Running) {
      // in some state other than idle
      console.log(
        'status update',
        workspaceStatusData.status,
        ' polling:',
        WorkspacePollingInterval[workspaceStatusData.status],
      );

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
      if (requestedStatus === 'Launching') {
        dispatch(setRequestedWorkspaceStatus('NotSet'));
      }
      dispatch(setActiveWorkspaceStatus(workspaceStatusData.status));
      setPollingInterval(WorkspacePollingInterval[workspaceStatusData.status]);
      return;
    }
    if (workspaceStatusData.status === WorkspaceStatus.NotFound) {
      if (requestedStatus !== WorkspaceStatus.Launching) {
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
