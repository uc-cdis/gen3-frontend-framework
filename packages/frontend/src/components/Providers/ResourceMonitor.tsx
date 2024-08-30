import React, { useState } from 'react';
import {
  //  useGetActivePayModelQuery,
  useGetWorkspaceStatusQuery,
  useTerminateWorkspaceMutation,
  WorkspaceStatus,
} from '@gen3/core';
import { notifications } from '@mantine/notifications';
import { useDeepCompareEffect } from 'use-deep-compare';

/**
 *  Monitors resource usage.
 *  Currently, handles workspace payment and idle status
 */

export const useResourceMonitor = () => {
  const [pollingInterval, setPollingnInterval] = useState<number | undefined>(
    undefined,
  );
  const {
    data: workSpaceStatus,
    // isError: isWorkspaceStatusError,
    // error: workspaceStatusError,
    // isSuccess: isWorkspaceStatysSuccess,
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

  console.log('workspace ', workSpaceStatus);

  useDeepCompareEffect(() => {
    console.log('checking idle');
    if (workSpaceStatus && workSpaceStatus.status === WorkspaceStatus.Running) {
      if (!workSpaceStatus.idleTimeLimit || workSpaceStatus.idleTimeLimit < 0) {
        terminateWorkspace();
        notifications.show({
          title: 'Workspace Shutdown',
          message:
            'Workspace has been idle for too long. Shutting workspace down',
          position: 'top-center',
        });
      } else {
        setPollingnInterval(5000);
      }
    }
  }, [terminateWorkspace, workSpaceStatus]);
};
