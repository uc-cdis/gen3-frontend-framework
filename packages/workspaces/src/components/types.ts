import { type WorkspaceTier } from '../types';

export interface WorkspaceCardConfig {
  label: string;
  description: string;
  tier: WorkspaceTier;
  tierLabel?: string;
  features?: string[];
  tooltip?: string;
  buttonLabel?: string;
  baseColor?: string;
}

export interface DefaultTierLandingClassnames extends Record<string, string> {
  root: string;
  background: string;
  label: string;
  description: string;
  additionalDescription: string;
  button: string;
}

export interface TierSelectorLandingConfiguration {
  label: string;
  description: string;
  additionalDescriptions: string[];
  classNames?: DefaultTierLandingClassnames;
}
