import { WorkspaceTier } from '../../types';

interface LabelAndDescription {
  label: string;
  description: string;
}

export interface TierToolbarConfiguration extends LabelAndDescription {
  requiresStopping: boolean;
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
