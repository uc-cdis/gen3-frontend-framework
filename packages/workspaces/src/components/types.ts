import { type WorkspaceTier } from '../types';
import { FreeWorkspaceTierConfiguration } from '../workspace/Tiers/types';

export interface WorkspaceCardConfig<
  T extends FreeWorkspaceTierConfiguration = FreeWorkspaceTierConfiguration,
> {
  label: string;
  description: string;
  tier: WorkspaceTier;
  features?: string[];
  tooltip?: string;
  buttonLabel?: string;
  tierConfiguration: T;
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
