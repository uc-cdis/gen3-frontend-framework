import { NavPageLayoutProps } from '../../features/Navigation';
import { WorkspaceConfiguration } from '../../features/Workspaces';


export interface WorkspacePageProps extends NavPageLayoutProps {
  workspaceProps: WorkspaceConfiguration;
}
