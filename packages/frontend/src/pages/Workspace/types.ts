import { NavPageLayoutProps } from '../../features/Navigation';
import { WorkspaceConfiguration } from '../../features/Workspace';


export interface WorkspacePageLayoutProps extends NavPageLayoutProps {
  workspaceProps: WorkspaceConfiguration;
}
