import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import { WorkspacesPanel }  from '../../features/Workspaces';
import { WorkspacePageProps } from './types';

const WorkspacesPage = ({
                     headerProps,
                     footerProps,
                     workspaceProps,
                   }: WorkspacePageProps): JSX.Element => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <WorkspacesPanel  />
    </NavPageLayout>
  );
};

export default WorkspacesPage;
