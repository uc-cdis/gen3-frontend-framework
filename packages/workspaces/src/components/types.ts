import { type WorkspaceTier } from '../types';

interface LabelAndDescription {
  label: string;
  description: string;
}

export interface WorkspaceCardConfig {
  label: string;
  description: string;
  tier: WorkspaceTier;
  features?: string[];
  tooltip?: string;
  buttonLabel?: string;
  runningLabel?: Partial<LabelAndDescription>;
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
