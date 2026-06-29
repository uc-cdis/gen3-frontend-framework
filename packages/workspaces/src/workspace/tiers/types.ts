import { WorkspaceTier } from '../../types';

interface LabelAndDescription {
  label: string;
  description: string;
}

export interface TierToolbarConfiguration extends LabelAndDescription {
  showStop: boolean;
  showStatus: boolean;
}

export interface SettingsPanelConfiguration {
  showKernels: boolean; // do we need to show the kernel panel?
}

export interface WorkspaceTierInformation {
  tier: WorkspaceTier;
  toolbar: TierToolbarConfiguration;
  settings: SettingsPanelConfiguration;
}

export interface FreeWorkspaceTierConfiguration extends WorkspaceTierInformation {
  baseUrl?: string;
  type: Extract<WorkspaceTier, 'free'>;
}

export interface RemoteComputeWorkspaceTierConfiguration extends WorkspaceTierInformation {
  type: Extract<WorkspaceTier, 'remote'>;
  baseUrl?: string;
}

export type RemoteComputeWorkspaceHandle = {
  /** Attach a running kernel to the notebook open in the iframe. */
  attachKernel: (kernelId: string, kernelName: string) => Promise<boolean>;
  /** True once the JupyterLite app inside the iframe reports ready. */
  isReady: boolean;
};
