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
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerData={{
        title: 'Gen3 Workspace Panel Configuration Page',
        content: 'Workspace Panel Configuration',
        key: 'gen3-workspace-panel-config-page',
      }}
    >
      <WorkspacePanelsEditor />
    </NavPageLayout>
  );
};

export default WorkspaceNotebooksPage;
