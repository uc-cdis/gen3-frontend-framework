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
    <NavPageLayout {...{ headerProps, footerProps }}>
      <Workspace config={workspaceProps.config}/>
    </NavPageLayout>
  );
};

export default WorkspacePage;
