import {
  TierSelectorLandingConfiguration,
  WorkspaceCardConfig,
} from '../../components/types';
import { Gen3AppConfigData, NavPageLayoutProps } from '@gen3/frontend';

export interface WorkspacesCenterPageConfiguration extends Gen3AppConfigData {
  workspaces: ReadonlyArray<WorkspaceCardConfig>;
  landingPage?: TierSelectorLandingConfiguration;
}

export interface WorkspacesPageLayoutProps extends NavPageLayoutProps {
  configuration: WorkspacesCenterPageConfiguration;
}
