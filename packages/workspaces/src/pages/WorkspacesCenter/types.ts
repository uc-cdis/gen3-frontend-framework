import { Gen3AppConfigData, NavPageLayoutProps } from '@gen3/frontend';
import { WorkspacesCenterConfiguration } from '../../workspace/types';

export type WorkspacesCenterPageConfiguration = WorkspacesCenterConfiguration &
  Gen3AppConfigData;

export interface WorkspacesPageLayoutProps extends NavPageLayoutProps {
  configuration: WorkspacesCenterPageConfiguration;
}
