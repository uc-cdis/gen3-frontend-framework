import { useState } from 'react';
import {
  setActiveWorkspaceStatus,
  useCoreDispatch,
  useGetWorkspaceStatusQuery,
  useTerminateWorkspaceMutation,
  WorkspaceStatus,
  isWorkspaceActive,
  useCoreSelector,
  selectActiveWorkspaceStatus,
} from '@gen3/core';
import { notifications } from '@mantine/notifications';
import { useDeepCompareEffect } from 'use-deep-compare';

const WorkspacePollingInterval: Record<WorkspaceStatus, number | undefined> = {
  'Not Found': undefined,
  Launching: 5000,
  Terminating: 10000,
  Running: undefined,
  Stopped: 5000,
  Errored: 1000,
  'Status Error': undefined,
};

/**
 *  Monitors resource usage.
 *  Currently, handles workspace payment and idle status
 */

export const useResourceMonitor = () => {
  const [pollingInterval, setPollingInterval] = useState<number | undefined>(
    undefined,
  );
  const {
    data: workspaceStatusData,
    isError: isWorkspaceStatusError,
    isSuccess: isWorkspaceStatusSuccess,
    refetch: refetchStatus,
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
  const currentWorkspaceStatus = useCoreSelector(selectActiveWorkspaceStatus);

  useDeepCompareEffect(() => {
    if (isWorkspaceStatusError) {
      dispatch(setActiveWorkspaceStatus(WorkspaceStatus.StatusError));
      setPollingInterval(undefined); // stop polling
      refetchStatus();
    }

    if (
      workspaceStatusData &&
      workspaceStatusData.status !== WorkspaceStatus.NotFound
    ) {
      // in some state other than idle
      console.log(
        'status update',
        workspaceStatusData.status,
        ' polling:',
        WorkspacePollingInterval[workspaceStatusData.status],
      );

      if (workspaceStatusData.status === WorkspaceStatus.Running) {
        // running need to check if
        if (
          !workspaceStatusData.idleTimeLimit ||
          workspaceStatusData.idleTimeLimit < 0
        ) {
          terminateWorkspace();
          notifications.show({
            title: 'Workspace Shutdown',
            message:
              'Workspace has been idle for too long. Shutting workspace down',
            position: 'top-center',
          });
        }
      }

      //   setActive(isWorkspaceActive(workspaceStatusData.status));
      dispatch(setActiveWorkspaceStatus(workspaceStatusData.status));
      setPollingInterval(WorkspacePollingInterval[workspaceStatusData.status]);
      refetchStatus();
    } else {
      // need to consider that if in launchState might get a number of NotFound status before Launching
      setPollingInterval(WorkspacePollingInterval[WorkspaceStatus.NotFound]);
      dispatch(setActiveWorkspaceStatus(WorkspaceStatus.NotFound));
      refetchStatus();
    }
  }, [dispatch, workspaceStatusData, isWorkspaceStatusError]);

  // useDeepCompareEffect(() => {
  //   if (isWorkspaceStatusError) {
  //     dispatch(setActiveWorkspaceStatus(WorkspaceStatus.StatusError));
  //     setPollingInterval(undefined); // stop polling
  //     refetchStatus();
  //   }

  // if (workSpaceStatus) {
  //   if (workSpaceStatus.status === WorkspaceStatus.Running) {
  //     // running need to check if
  //     if (
  //       !workSpaceStatus.idleTimeLimit ||
  //       workSpaceStatus.idleTimeLimit < 0
  //     ) {
  //         terminateWorkspace();
  //         notifications.show({
  //           title: 'Workspace Shutdown',
  //           message:
  //             'Workspace has been idle for too long. Shutting workspace down',
  //           position: 'top-center',
  //         });
  //       }
  //       setPollingInterval(RUNNING_POLLING_INTERVAL);
  //     } else if (isWorkspaceActive(workSpaceStatus.status)) {
  //       dispatch(setActiveWorkspaceStatus(workSpaceStatus.status)); // set last known state of workspace
  //       setPollingInterval(ACTIVE_POLLING_INTERVAL); // either Launching or Terminating want to poll until Running or Not Found (no workspace running)
  //     } else {
  //       dispatch(setActiveWorkspaceStatus(workSpaceStatus.status));
  //       setPollingInterval(undefined); // stop polling
  //     }
  //   }
  // }, [terminateWorkspace, workSpaceStatus]);
};
