import { NavPageLayoutProps } from '../../features/Navigation';
import { WorkspaceConfiguration } from '../../features/Workspace';


export interface WorkspacePageProps extends NavPageLayoutProps {
  workspaceProps: WorkspaceConfiguration;
}
