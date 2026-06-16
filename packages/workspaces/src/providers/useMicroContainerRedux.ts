// import { useCallback, useEffect, useMemo, useState } from 'react';
// import {
//   useDoesHatcheryOptionExistsQuery,
//   useHatcheryOptionsQuery,
//   useHatcheryStatusQuery,
//   useLaunchHatcheryWorkspaceMutation,
//   useTerminateHatcheryWorkspaceMutation,
// } from '../core/hatcheryApi';
// import { getRTKQErrorMessage } from '../utils';
// import {
//   MicroContainerContextValue,
//   MicroContainerStatus,
// } from './MicroContainerProvider';
// import {
//   selectActiveWorkspaceStatus,
//   setActiveWorkspaceId,
//   setActiveWorkspaceStatus,
//   useCoreDispatch,
//   useCoreSelector,
//   WorkspaceStatus,
// } from '@gen3/core';
// import { convertSecondsToMilliseconds } from '@gen3/frontend';
//
// // intervals to use for polling
// // TODO: convert to seconds/minutes for readability
// const WorkspacePollingInterval: Record<WorkspaceStatus, number> = {
//   [WorkspaceStatus.NotFound]: 0,
//   [WorkspaceStatus.Launching]: convertSecondsToMilliseconds(1),
//   [WorkspaceStatus.Terminating]: convertSecondsToMilliseconds(1),
//   [WorkspaceStatus.Running]: convertSecondsToMilliseconds(300),
//   [WorkspaceStatus.Stopped]: convertSecondsToMilliseconds(5),
//   [WorkspaceStatus.Errored]: convertSecondsToMilliseconds(10),
//   [WorkspaceStatus.LaunchError]: convertSecondsToMilliseconds(10),
//   [WorkspaceStatus.TerminateError]: convertSecondsToMilliseconds(10),
//   [WorkspaceStatus.StatusError]: 0,
// };
//
// export function useMicroContainer(
//   tag: string,
//   enabled: boolean,
// ): MicroContainerContextValue {
//   const status = useCoreSelector(selectActiveWorkspaceStatus);
//   const [containerHash, setContainerHash] = useState<string | null>(null);
//
//   const coreDispatch = useCoreDispatch();
//
//   // get the options for the workspace could move to parent since
//   const { data: optionData, error: optionsError } = useDoesHatcheryOptionExistsQuery(
//     tag,
//     { skip: containerHash !== null },
//   );
//
//   const {
//     data: hatcheryStatus,
//     error: statusError,
//     refetch: refetchStatus,
//   } = useHatcheryStatusQuery(containerHash, {
//     skip: containerHash === null || !enabled,
//     pollingInterval: WorkspacePollingInterval[status],
//     refetchOnMountOrArgChange: 1800,
//     refetchOnFocus: true,
//   });
//
//   const [launchTrigger] = useLaunchHatcheryWorkspaceMutation();
//   const [terminateWorkspace] = useTerminateHatcheryWorkspaceMutation();
//
//   useEffect(() => {
//     if (optionData) setContainerHash(optionData);
//   }, [optionData]);
//
//   useEffect(() => {
//     if (hatcheryStatus)
//       setStatus((hatcheryStatus ?? 'unknown') as MicroContainerStatus);
//   }, [hatcheryStatus]);
//
//   const lastError = useMemo(() => {
//     if (!optionsError && !statusError) return null;
//     let errorStr = '';
//     if (optionsError) errorStr += getRTKQErrorMessage(optionsError);
//     if (statusError) errorStr += getRTKQErrorMessage(statusError);
//     return errorStr;
//   }, [optionsError, statusError]);
//
//   const launch = useCallback(async (): Promise<void> => {
//     if (
//       !enabled ||
//       hatcheryStatus === WorkspaceStatus.Launching ||
//       hatcheryStatus === WorkspaceStatus.Running
//     )
//       return;
//
//     try {
//       coreDispatch(setActiveWorkspaceStatus(WorkspaceStatus.Launching));
//       const query = containerHash ? encodeURIComponent(containerHash) : '';
//       const launchResults = await launchTrigger(query).unwrap();
//       if (!launchResults) {
//         // launch error, will show error message and then reset
//         coreDispatch(setActiveWorkspaceStatus(WorkspaceStatus.LaunchError));
//       } else {
//         coreDispatch(setActiveWorkspaceStatus(WorkspaceStatus.Running));
//         coreDispatch(setActiveWorkspaceId({ id: containerHash ?? 'default' }));
//       }
//     } catch (_error: unknown) {
//       coreDispatch(setActiveWorkspaceStatus(WorkspaceStatus.LaunchError));
//     }
//     // Status will resolve to 'running' on the next poll
//   }, [enabled, hatcheryStatus, containerHash, launchTrigger]);
//
//   const terminate = useCallback(async () => {
//     if (!enabled || hatcheryStatus === 'terminating') return;
//     coreDispatch(setActiveWorkspaceStatus(WorkspaceStatus.Running));
//     const query = containerHash ? encodeURIComponent(containerHash) : '';
//     try {
//         const status = await terminateWorkspace(query).unwrap();
//         if ()
//         refetchStatus();
//
//     }
//   }, [
//     containerHash,
//     enabled,
//     hatcheryStatus,
//     terminateWorkspace,
//     refetchStatus,
//   ]);
//
//   const resetStatus = useCallback(() => {
//     setStatus('unknown');
//   }, []);
//
//   return useMemo(
//     () => ({
//       status,
//       containerHash,
//       lastError,
//       launch,
//       terminate,
//       resetStatus,
//     }),
//     [containerHash, lastError, launch, status, terminate, resetStatus],
//   );
// }
