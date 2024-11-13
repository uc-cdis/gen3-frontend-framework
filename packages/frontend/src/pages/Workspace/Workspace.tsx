import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import Workspace from '../../features/Workspace/Workspace';
import { WorkspacePageLayoutProps } from './types';

const WorkspacePage = ({
  headerProps,
  footerProps,
  workspaceProps,
}: WorkspacePageLayoutProps): JSX.Element => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerData={{
        title: 'Gen3 Workspace Page',
        content: 'Workspace page',
        key: 'gen3-workspace-page',
      }}
    >
      <Workspace config={workspaceProps} />
    </NavPageLayout>
  );
};

export default WorkspacePage;
