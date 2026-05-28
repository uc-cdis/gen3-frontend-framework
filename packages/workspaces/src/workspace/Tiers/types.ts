import { WorkspaceTier } from '../../types';

interface LabelAndDescription {
  label: string;
  description: string;
}

export interface WorkspaceTierInformation extends LabelAndDescription {
  type: WorkspaceTier;
}

export interface FreeWorkspaceTierConfiguration extends WorkspaceTierInformation {
  baseUrl?: string;
  type: Extract<WorkspaceTier, 'free'>;
}
