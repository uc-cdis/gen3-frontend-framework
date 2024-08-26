import React from 'react';
import {
  NavPageLayout,
  NavPageLayoutProps,
} from '../../../features/Navigation';
import WorkspacePanelsEditor from '../../../features/Workspace/admin/WorkspacePanelsEditor';

interface Props extends NavPageLayoutProps {
  isRunning?: boolean;
}

const WorkspaceNotebooksPage = ({ headerProps, footerProps }: Props) => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <WorkspacePanelsEditor />
    </NavPageLayout>
  );
};

export default WorkspaceNotebooksPage;
