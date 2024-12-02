import { ActionFactory } from './actionFactory';
import { notifications } from '@mantine/notifications';
import {
  coreStore,
  sowerStatusApi,
  addSowerJob,
  removeSowerJob,
  type JobWithActions,
  type TwoPartActionConfig,
} from '@gen3/core';

interface JobMonitorConfig {
  pollingInterval?: number; // in milliseconds
  maxRetries?: number;
  debug?: boolean;
}

class GlobalJobMonitor {
  private static instance: GlobalJobMonitor;
  private pollingInterval: NodeJS.Timeout | null = null;
  private isPolling: boolean = false;
  private config: JobMonitorConfig;

  private static DEFAULT_CONFIG: JobMonitorConfig = {
    pollingInterval: 5000, // 5 seconds default
    maxRetries: 3,
    debug: false,
  };

  private constructor(config: JobMonitorConfig = {}) {
    this.config = { ...GlobalJobMonitor.DEFAULT_CONFIG, ...config };
    this.checkAndUpdatePolling();
  }

  static getInstance(config?: JobMonitorConfig) {
    if (!GlobalJobMonitor.instance) {
      GlobalJobMonitor.instance = new GlobalJobMonitor(config);
    } else if (config) {
      // Update config if provided
      GlobalJobMonitor.instance.updateConfig(config);
    }
    return GlobalJobMonitor.instance;
  }

  updateConfig(newConfig: Partial<JobMonitorConfig>) {
    this.config = { ...this.config, ...newConfig };

    // If polling is active, restart it with new interval
    if (this.isPolling) {
      this.stopMonitoring();
      this.startMonitoring();
    }

    if (this.config.debug) {
      console.log('Monitor config updated:', this.config);
    }
  }

  getConfig(): JobMonitorConfig {
    return { ...this.config };
  }

  registerJob(jobId: string, config: TwoPartActionConfig) {
    coreStore.dispatch(
      addSowerJob({
        jobId,
        config,
        part: 1,
        timestamp: Date.now(),
      }),
    );
    // Start polling when a job is registered
    this.startPollingIfNeeded();
  }

  private getPendingActions() {
    const state = coreStore.getState();
    return state.sowerJobsList.jobIds;
  }

  private startPollingIfNeeded() {
    const pendingActions = this.getPendingActions();
    if (Object.keys(pendingActions).length > 0 && !this.isPolling) {
      this.startMonitoring();
    }
  }

  private stopPollingIfNoJobs() {
    const pendingActions = this.getPendingActions();
    if (Object.keys(pendingActions).length === 0 && this.isPolling) {
      this.stopMonitoring();
    }
  }

  private checkAndUpdatePolling() {
    const pendingActions = this.getPendingActions();
    if (Object.keys(pendingActions).length > 0 && !this.isPolling) {
      this.startMonitoring();
    } else if (Object.keys(pendingActions).length === 0 && this.isPolling) {
      this.stopMonitoring();
    }
  }

  private async checkJobStatus(jobId: string, pendingAction: JobWithActions) {
    try {
      const response = await coreStore.dispatch(
        sowerStatusApi.endpoints.getSowerJobStatus.initiate(jobId),
      );

      if ('data' in response) {
        const status = response.data;

        if (status?.status === 'completed' && pendingAction.part === 1) {
          this.executeStep2(pendingAction);
          this.stopPollingIfNoJobs();
        } else if (status?.status === 'failed') {
          this.handleError(jobId, 'Job failed');
          this.stopPollingIfNoJobs();
        }
      }
    } catch (error) {
      this.handleError(jobId, 'Failed to check job status');
      this.stopPollingIfNoJobs();
    }
  }

  private async executeStep2(pendingAction: JobWithActions) {
    if (pendingAction.config?.part2 === undefined) {
      coreStore.dispatch(removeSowerJob(pendingAction.jobId));
      return;
    }

    try {
      const action = ActionFactory.getAction(pendingAction.config.part2.action);
      await action(pendingAction.config.part2.params);

      notifications.show({
        title: 'Success',
        message: 'Action completed successfully',
        color: 'green',
      });

      coreStore.dispatch(removeSowerJob(pendingAction.jobId));
    } catch (error) {
      this.handleError(pendingAction.jobId, 'Failed to complete second step');
    }
  }

  private handleError(jobId: string, message: string) {
    notifications.show({
      title: 'Error',
      message,
      color: 'red',
    });
    coreStore.dispatch(removeSowerJob(jobId));
  }

  private startMonitoring() {
    if (!this.isPolling) {
      this.isPolling = true;
      this.pollingInterval = setInterval(() => {
        const pendingActions = this.getPendingActions();

        if (Object.keys(pendingActions).length === 0) {
          this.stopMonitoring();
          return;
        }

        Object.entries(pendingActions).forEach(([jobId, action]) => {
          this.checkJobStatus(jobId, action);
        });
      }, this.config.pollingInterval);

      if (this.config.debug) {
        console.log(
          `Polling started with interval: ${this.config.pollingInterval}ms`,
        );
      }
    }
  }

  private stopMonitoring() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.isPolling = false;

      if (this.config.debug) {
        console.log('Polling stopped');
      }
    }
  }

  cleanup() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
}

export default GlobalJobMonitor;
