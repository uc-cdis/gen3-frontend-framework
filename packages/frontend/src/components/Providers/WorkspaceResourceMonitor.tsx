// import { useEffect, useRef } from 'react';
// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { notifications } from '@mantine/notifications';
// import {
//   setActiveWorkspaceStatus,
//   useCoreDispatch,
//   useCoreSelector,
//   useGetWorkspaceStatusQuery,
//   useGetWorkspacePayModelsQuery,
//   useTerminateWorkspaceMutation,
//   selectRequestedWorkspaceStatus,
//   WorkspaceStatus,
//   setRequestedWorkspaceStatus,
// } from '@gen3/core';
//
// // Move intervals to constants
// const POLLING_INTERVALS = {
//   'Not Found': 0,
//   Launching: 5000,
//   Terminating: 5000,
//   Running: 300000,
//   Stopped: 5000,
//   Errored: 10000,
//   'Status Error': 0,
// } as const;
//
// const PAYMENT_POLLING_INTERVALS = {
//   'Not Found': 0,
//   Launching: 120000, // 2 minutes
//   Terminating: 0,
//   Running: 900000, // 15 minutes
//   Stopped: 0,
//   Errored: 0,
//   'Status Error': 0,
// } as const;
//
// const WORKSPACE_SHUTDOWN_ALERT_LIMIT = 30000;
//
// // Persistent monitoring hook
// export const useWorkspaceMonitor = () => {
//   const dispatch = useCoreDispatch();
//   const requestedStatus = useCoreSelector(selectRequestedWorkspaceStatus);
//   const statusIntervalRef = useRef<NodeJS.Timeout>();
//   const paymentIntervalRef = useRef<NodeJS.Timeout>();
//   const [terminateWorkspace] = useTerminateWorkspaceMutation();
//
//   const {
//     data: workspaceStatusData,
//     isError: isWorkspaceStatusError,
//     refetch: refetchStatus,
//   } = useGetWorkspaceStatusQuery(undefined, {
//     pollingInterval: 0,
//     refetchOnMountOrArgChange: true,
//     refetchOnFocus: true,
//   });
//
//   const {
//     data: paymentModelData,
//     isError: isPaymentModelError,
//     error: paymentModelError,
//     refetch: refetchPayment,
//   } = useGetWorkspacePayModelsQuery(undefined, {
//     pollingInterval: 0,
//     refetchOnMountOrArgChange: true,
//   });
//
//   const handleWorkspaceStatus = async () => {
//     if (!workspaceStatusData) return;
//
//     if (isWorkspaceStatusError) {
//       dispatch(setActiveWorkspaceStatus(WorkspaceStatus.StatusError));
//       return;
//     }
//
//     const { status, idleTimeLimit, lastActivityTime } = workspaceStatusData;
//
//     if (status === WorkspaceStatus.Running) {
//       if (idleTimeLimit && idleTimeLimit > 0 && lastActivityTime > 0) {
//         const remainingTime = idleTimeLimit - (Date.now() - lastActivityTime);
//
//         if (remainingTime <= 0) {
//           await terminateWorkspace();
//           dispatch(setActiveWorkspaceStatus(WorkspaceStatus.Terminating));
//           notifications.show({
//             title: 'Workspace Shutdown',
//             message:
//               'Workspace has been idle for too long. Shutting workspace down',
//             position: 'top-center',
//           });
//           return;
//         }
//
//         if (remainingTime <= WORKSPACE_SHUTDOWN_ALERT_LIMIT) {
//           notifications.show({
//             title: 'Workspace Warning',
//             message: 'Workspace has been idle for too long. Will shutdown soon',
//             position: 'top-center',
//           });
//         }
//       }
//
//       if (requestedStatus === 'Launch') {
//         dispatch(setRequestedWorkspaceStatus('Unset'));
//       }
//     }
//
//     if (
//       status === WorkspaceStatus.NotFound &&
//       requestedStatus !== 'Launching'
//     ) {
//       dispatch(setActiveWorkspaceStatus(WorkspaceStatus.NotFound));
//       if (requestedStatus === 'Terminating') {
//         dispatch(setRequestedWorkspaceStatus('NotSet'));
//       }
//     }
//
//     dispatch(setActiveWorkspaceStatus(status));
//     dispatch(updateLastStatusCheck());
//   };
//
//   const handlePaymentModelCheck = () => {
//     if (isPaymentModelError) {
//       console.error('Payment model error: ', paymentModelError.toString());
//     }
//     if (paymentModelData?.noPayModel) {
//       console.warn('No payment model defined');
//     }
//   };
//
//   // Setup status monitoring interval
//   useEffect(() => {
//     const startStatusMonitoring = () => {
//       if (workspaceStatusData?.status) {
//         const interval = POLLING_INTERVALS[workspaceStatusData.status];
//         if (interval > 0) {
//           statusIntervalRef.current = setInterval(() => {
//             refetchStatus();
//           }, interval);
//         }
//       }
//     };
//
//     if (statusIntervalRef.current) {
//       clearInterval(statusIntervalRef.current);
//     }
//
//     startStatusMonitoring();
//     dispatch(setMonitoringEnabled(true));
//
//     return () => {
//       if (statusIntervalRef.current) {
//         clearInterval(statusIntervalRef.current);
//       }
//     };
//   }, [workspaceStatusData?.status, dispatch, refetchStatus]);
//
//   // Setup payment model monitoring interval
//   useEffect(() => {
//     const startPaymentMonitoring = () => {
//       if (workspaceStatusData?.status) {
//         const interval = PAYMENT_POLLING_INTERVALS[workspaceStatusData.status];
//         if (interval > 0) {
//           paymentIntervalRef.current = setInterval(() => {
//             refetchPayment();
//           }, interval);
//         }
//       }
//     };
//
//     if (paymentIntervalRef.current) {
//       clearInterval(paymentIntervalRef.current);
//     }
//
//     startPaymentMonitoring();
//
//     return () => {
//       if (paymentIntervalRef.current) {
//         clearInterval(paymentIntervalRef.current);
//       }
//     };
//   }, [workspaceStatusData?.status, refetchPayment]);
//
//   // Handle status changes
//   useEffect(() => {
//     handleWorkspaceStatus();
//   }, [workspaceStatusData, isWorkspaceStatusError, requestedStatus]);
//
//   // Handle payment model changes
//   useEffect(() => {
//     handlePaymentModelCheck();
//     dispatch(updateLastPaymentCheck());
//   }, [paymentModelData, isPaymentModelError]);
//
//   return {
//     status: workspaceStatusData?.status,
//     isStatusError: isWorkspaceStatusError,
//     isPaymentError: isPaymentModelError,
//     paymentModel: paymentModelData,
//     refetchStatus,
//     refetchPayment,
//   };
// };
//
// // Root level component to enable persistent monitoring
// export const WorkspaceMonitorProvider: React.FC<{
//   children: React.ReactNode;
// }> = ({ children }) => {
//   useWorkspaceMonitor();
//   return <>{children}</>;
// };
