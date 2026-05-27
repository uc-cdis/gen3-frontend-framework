import { WorkspaceTier } from '../types';

interface LabelAndDescription {
  label: string;
  description: string;
}

export interface WorkspaceTierConfiguration {
  labelAndDescription?: LabelAndDescription;
  type: WorkspaceTier;
}

export interface FreeWorkspaceTierConfiguration extends WorkspaceTierConfiguration {
  baseUrl?: string;
  type: Extract<WorkspaceTier, 'free'>;
}
