// import { notifications } from '@mantine/notifications';
// import {
//   addSowerJob,
//   coreStore,
//   type CreateAndExportActionConfig,
//   type JobWithActions,
//   removeSowerJob,
//   sowerApi,
//   updateSowerJobStatus,
// } from '@gen3/core';
//
// import { findSendResultsAction } from '../features/CohortBuilder/downloads/actions/TwoStepActionButton';
// import { SendResultsActionNotFoundError } from '../features/CohortBuilder/downloads/actions/types';
//
// interface JobMonitorConfig {
//   pollingInterval?: number; // in seconds
//   debug?: boolean;
// }
//
// export class SowerJobsMonitor {
//   private static instance: SowerJobsMonitor;
//   private pollingInterval: NodeJS.Timeout | null = null;
//   private isPolling: boolean = false;
//   private config: JobMonitorConfig;
//
//   private static DEFAULT_CONFIG: JobMonitorConfig = {
//     pollingInterval: 1000 * 10, // 5-second default
//     debug: true,
//   };
//
//   private constructor(config: JobMonitorConfig = {}) {
//     this.config = { ...SowerJobsMonitor.DEFAULT_CONFIG, ...config };
//     this.checkAndUpdatePolling();
//   }
//
//   static getInstance(config?: JobMonitorConfig) {
//     if (!SowerJobsMonitor.instance) {
//       SowerJobsMonitor.instance = new SowerJobsMonitor(config);
//     } else if (config) {
//       // Update config if provided
//       SowerJobsMonitor.instance.updateConfig(config);
//     }
//     return SowerJobsMonitor.instance;
//   }
//
//   updateConfig(newConfig: Partial<JobMonitorConfig>) {
//     this.config = { ...this.config, ...newConfig };
//
//     // If polling is active, restart it with new interval
//     if (this.isPolling) {
//       this.stopMonitoring();
//       this.startMonitoring();
//     }
//
//     if (this.config.debug) {
//       console.log('Monitor config updated:', this.config);
//     }
//   }
//
//   getConfig(): JobMonitorConfig {
//     return { ...this.config };
//   }
//
//   registerJob(jobId: string, config: CreateAndExportActionConfig) {
//     const timestamp = Date.now();
//     coreStore.dispatch(
//       addSowerJob({
//         jobId,
//         config,
//         stage: 1,
//         created: timestamp,
//         updated: timestamp,
//         name: '',
//         status: 'Unknown',
//       }),
//     );
//     // Start polling when a job is registered
//     this.startPollingIfNeeded();
//   }
//
//   private getPendingActions(): Record<string, JobWithActions> {
//     const state = coreStore.getState();
//     return state.sowerJobsList.jobs;
//   }
//
//   private startPollingIfNeeded() {
//     const pendingActions = this.getPendingActions();
//     if (Object.keys(pendingActions).length > 0 && !this.isPolling) {
//       this.startMonitoring();
//     }
//   }
//
//   private stopPollingIfNoJobs() {
//     const pendingActions = this.getPendingActions();
//     if (Object.keys(pendingActions).length === 0 && this.isPolling) {
//       this.stopMonitoring();
//     }
//   }
//
//   private checkAndUpdatePolling() {
//     const pendingActions = this.getPendingActions();
//     console.log('checkAndUpdatePolling: ', pendingActions);
//     if (Object.keys(pendingActions).length > 0 && !this.isPolling) {
//       this.startMonitoring();
//     } else if (Object.keys(pendingActions).length === 0 && this.isPolling) {
//       this.stopMonitoring();
//     }
//   }
//
//   private async checkJobStatus(sowerJob: JobWithActions) {
//     const jobId = sowerJob.jobId;
//     const job = coreStore.getState().sowerJobsList.jobs[jobId];
//
//     try {
//       const response = await coreStore.dispatch(
//         sowerApi.endpoints.getSowerJobStatus.initiate(jobId),
//       );
//
//       console.log('checkJobStatus: ', response);
//
//       if ('data' in response && response.data) {
//         const jobStatus = response.data;
//
//         const updatedTimestamp = Date.now();
//
//         if (jobStatus.status === 'Completed' && sowerJob.stage === 1) {
//           if (sowerJob.config?.sendJobAction) {
//             coreStore.dispatch(
//               updateSowerJobStatus({
//                 ...job,
//                 status: 'Completed',
//               }),
//             );
//           }
//           this.executeStep2(sowerJob);
//           this.stopPollingIfNoJobs();
//         } else if (jobStatus?.status === 'Failed') {
//           this.handleError(jobId, 'Job failed');
//           this.stopPollingIfNoJobs();
//         }
//         coreStore.dispatch(
//           updateSowerJobStatus({
//             ...job,
//             status: jobStatus.status || 'Unknown',
//           }),
//         );
//       }
//     } catch (error: unknown) {
//       this.handleError(jobId, 'Failed to check job status');
//       this.stopPollingIfNoJobs();
//     }
//   }
//
//   private async executeStep2(pendingAction: JobWithActions) {
//     try {
//       // get the objectId of the job
//       if (pendingAction.config?.sendJobAction) {
//         const action = findSendResultsAction(
//           pendingAction.config.sendJobAction.actionName,
//         );
//         await action({
//           parameters: pendingAction.config.sendJobAction.parameters,
//         });
//
//         notifications.show({
//           title: 'Success',
//           message: 'Action completed successfully',
//           color: 'green',
//         });
//
//         coreStore.dispatch(removeSowerJob(pendingAction.jobId));
//       }
//     } catch (error: unknown) {
//       if (error instanceof SendResultsActionNotFoundError) {
//         this.handleError(
//           pendingAction.jobId,
//           'Failed to find send results action',
//         );
//       }
//       if (error instanceof Error)
//         this.handleError(pendingAction.jobId, 'Failed to complete second step');
//     }
//   }
//
//   private handleError(jobId: string, message: string) {
//     notifications.show({
//       title: 'Error',
//       message,
//       color: 'red',
//     });
//     coreStore.dispatch(removeSowerJob(jobId));
//   }
//
//   private startMonitoring() {
//     if (!this.isPolling) {
//       this.isPolling = true;
//       this.pollingInterval = setInterval(() => {
//         const pendingActions = this.getPendingActions();
//         if (Object.keys(pendingActions).length === 0) {
//           this.stopMonitoring();
//           return;
//         }
//
//         Object.entries(pendingActions).forEach(async ([jobId, action]) => {
//           await this.checkJobStatus(action);
//         });
//       }, this.config.pollingInterval);
//
//       if (this.config.debug) {
//         console.log(
//           `Polling started with interval: ${this.config.pollingInterval}ms`,
//         );
//       }
//     }
//   }
//
//   private stopMonitoring() {
//     if (this.pollingInterval) {
//       clearInterval(this.pollingInterval);
//       this.pollingInterval = null;
//       this.isPolling = false;
//
//       if (this.config.debug) {
//         console.log('Polling stopped');
//       }
//     }
//   }
//
//   cleanup() {
//     if (this.pollingInterval) {
//       clearInterval(this.pollingInterval);
//     }
//   }
// }
