import {
  TierSelectorLandingConfiguration,
  WorkspaceCardConfig,
} from '@/components/types';
import { Gen3AppConfigData, NavPageLayoutProps } from '@gen3/frontend';

export interface WorkspacesCenterConfiguration extends Gen3AppConfigData {
  workspaces: Array<WorkspaceCardConfig>;
  landingPage?: TierSelectorLandingConfiguration;
}

export interface WorkspacesPageLayoutProps extends NavPageLayoutProps {
  configuration: WorkspacesCenterConfiguration;
}
