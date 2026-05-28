import { WorkspaceTier } from '../../types';

interface LabelAndDescription {
  label: string;
  description: string;
}

export interface TierToolbarConfiguration extends LabelAndDescription {
  requiresStopping: boolean;
}

export interface WorkspaceTierInformation {
  tier: WorkspaceTier;
  toolbar: TierToolbarConfiguration;
}

export interface FreeWorkspaceTierConfiguration extends WorkspaceTierInformation {
  baseUrl?: string;
  type: Extract<WorkspaceTier, 'free'>;
}
