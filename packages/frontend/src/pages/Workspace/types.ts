import { NavPageLayoutProps } from '../../features/Navigation';

export interface WorkspaceProps {
}

export interface WorkspacePageLayoutProps extends NavPageLayoutProps {
  queryProps: WorkspaceProps;
}
