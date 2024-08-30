import { useState } from 'react';
import {
  setActiveWorkspaceStatus,
  useCoreDispatch,
  useGetWorkspaceStatusQuery,
  useTerminateWorkspaceMutation,
  WorkspaceStatus,
  isWorkspaceActive,
} from '@gen3/core';
import { notifications } from '@mantine/notifications';
import { useDeepCompareEffect } from 'use-deep-compare';

/**
 *  Monitors resource usage.
 *  Currently, handles workspace payment and idle status
 */

export const useResourceMonitor = () => {
  const [pollingInterval, setPollingInterval] = useState<number | undefined>(
    undefined,
  );
  const {
    data: workSpaceStatus,
    isError: isWorkspaceStatusError,
    // error: workspaceStatusError,
    isSuccess: isWorkspaceStatusSuccess,
    // refetch: refetchStatus,
  } = useGetWorkspaceStatusQuery(undefined, {
    pollingInterval: pollingInterval,
  });

  // const {
  //   data: payModel,
  //   refetch: refetechPayModel,
  //   isError: isPaymodelError,
  //   isSuccess: isPaymodelSuccess,
  // } = useGetActivePayModelQuery();

  const [terminateWorkspace] = useTerminateWorkspaceMutation();

  const dispatch = useCoreDispatch();
  const RUNNING_POLLING_INTERVAL = 10000; // Workspace is running
  const ACTIVE_POLLING_INTERVAL = 5000; // workspace is active: Launching, Running, Terminated

  useDeepCompareEffect(() => {
    if (!isWorkspaceStatusError) {
      dispatch(setActiveWorkspaceStatus(WorkspaceStatus.StatusError));
      setPollingInterval(undefined); // stop polling
    }

    if (workSpaceStatus) {
      if (workSpaceStatus.status === WorkspaceStatus.Running) {
        // running need to check if
        if (
          !workSpaceStatus.idleTimeLimit ||
          workSpaceStatus.idleTimeLimit < 0
        ) {
          terminateWorkspace();
          notifications.show({
            title: 'Workspace Shutdown',
            message:
              'Workspace has been idle for too long. Shutting workspace down',
            position: 'top-center',
          });
        }
        setPollingInterval(RUNNING_POLLING_INTERVAL);
      } else if (isWorkspaceActive(workSpaceStatus.status)) {
        dispatch(setActiveWorkspaceStatus(workSpaceStatus.status)); // set last known state of workspace
        setPollingInterval(ACTIVE_POLLING_INTERVAL); // either Launching or Terminating want to poll until Running or Not Found (no workspace running)
      } else {
        dispatch(setActiveWorkspaceStatus(workSpaceStatus.status));
        setPollingInterval(undefined); // stop polling
      }
    }
  }, [terminateWorkspace, workSpaceStatus]);
};
