import {
  TierSelectorLandingConfiguration,
  WorkspaceCardConfig,
} from '../components/types';
import {
  FreeWorkspaceTierConfiguration,
  RemoteComputeWorkspaceTierConfiguration,
} from './tiers/types';

export type TierLayoutConfiguration = Record<
  string,
  FreeWorkspaceTierConfiguration | RemoteComputeWorkspaceTierConfiguration
>;

export interface WorkspacesCenterConfiguration {
  workspaces: Record<string, WorkspaceCardConfig>;
  landingPage?: TierSelectorLandingConfiguration;
  tierConfiguration: Record<
    string,
    FreeWorkspaceTierConfiguration | RemoteComputeWorkspaceTierConfiguration
  >;
}
