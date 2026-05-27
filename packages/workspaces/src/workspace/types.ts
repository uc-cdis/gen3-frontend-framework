import {
  TierSelectorLandingConfiguration,
  WorkspaceCardConfig,
} from '../components/types';

export interface WorkspacesCenterConfiguration {
  workspaces: Record<string, WorkspaceCardConfig>;
  landingPage?: TierSelectorLandingConfiguration;
}
