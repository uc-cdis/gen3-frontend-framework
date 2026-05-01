import { type WorkspaceTier } from '../types';

export interface WorkspaceCardConfig {
  label: string;
  description: string;
  tier: WorkspaceTier;
  features?: string[];
  tooltip?: string;
  buttonLabel?: string;
}
