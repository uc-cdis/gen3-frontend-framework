import React from 'react';
import { NavPageLayout } from '../../../features/Navigation';
import { WorkspacePanelsEditor } from '../../../features/Workspace/admin/WorkspacePanelsEditor';

const WorkspaceNotebooksPage = ({ headerProps, footerProps, authz }: Props) => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <WorkspacePanelsEditor />
    </NavPageLayout>
  );
};

export default WorkspaceNotebooksPage;
