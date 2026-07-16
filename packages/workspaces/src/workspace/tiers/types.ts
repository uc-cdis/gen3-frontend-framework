import { WorkspaceTier } from '../../types';

interface LabelAndDescription {
  label: string;
  description: string;
  app?: string;
}

export interface TierToolbarConfiguration extends LabelAndDescription {
  showStop: boolean;
  showStatus: boolean;
  tierLabel?: string;
}

export interface SettingsPanelConfiguration {
  showKernels: boolean; // do we need to show the kernel panel?
  width?: number;
}

export interface DataAndToolsPanelConfiguration {
  enabled: boolean;
  tabs?: LabelAndDescription[];
  width?: number;
}

export interface WorkspaceTierInformation {
  toolbar: TierToolbarConfiguration;
  dataAndTools: DataAndToolsPanelConfiguration;
  settings: SettingsPanelConfiguration;
}

export interface FreeWorkspaceTierConfiguration extends WorkspaceTierInformation {
  baseUrl?: string;
  type: Extract<WorkspaceTier, 'free'>;
}

export interface RemoteComputeWorkspaceTierConfiguration extends WorkspaceTierInformation {
  baseUrl?: string;
  type: Extract<WorkspaceTier, 'remote'>;
  startTimeLimit?: number; // time limit in seconds
}

export type RemoteComputeWorkspaceHandle = {
  /** Attach a running kernel to the notebook open in the iframe. */
  attachKernel: (kernelId: string, kernelName: string) => Promise<boolean>;
  /** True once the JupyterLite app inside the iframe reports ready. */
  isReady: boolean;
};
