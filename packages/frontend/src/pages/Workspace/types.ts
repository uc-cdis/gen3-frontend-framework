import { NavPageLayoutProps } from '../../features/Navigation';
import { WorkspaceConfig } from '../../features/Workspace';

export interface WorkspacePageLayoutProps extends NavPageLayoutProps {
  workspaceProps: WorkspaceConfig;
}
