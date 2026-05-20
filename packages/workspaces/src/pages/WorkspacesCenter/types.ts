import { WorkspaceCardConfig } from '@/components/types';
import { NavPageLayoutProps } from '@gen3/frontend';

export interface WorkspacesCenterConfiguration {
  workspaces: Array<WorkspaceCardConfig>;
}

export interface WorkspacesPageLayoutProps extends NavPageLayoutProps {
  configuration: WorkspacesCenterConfiguration;
}
