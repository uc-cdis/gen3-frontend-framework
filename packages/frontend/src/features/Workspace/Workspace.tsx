import React from 'react';
import { WorkspaceConfig } from './types';
import ProtectedContent from '../../components/Protected/ProtectedContent';
import WorkspaceProvider from './WorkspaceProvider';
import WorkspaceStatusProvider from './WorkspaceStatusProvider';
import WorkspaceNotebookPanelWithControls from './WorkspaceNotebookPanelWithControls';

interface WorkspaceProps {
  config: WorkspaceConfig;
  workspaceToRunId?: string;
}

const Workspace = ({ config, workspaceToRunId }: WorkspaceProps) => {
  return (
    <ProtectedContent>
      <WorkspaceProvider config={config}>
        <WorkspaceStatusProvider>
          <div className="flex flex-col grow w-full relative">
            <WorkspaceNotebookPanelWithControls id={workspaceToRunId} />
          </div>
        </WorkspaceStatusProvider>
      </WorkspaceProvider>
    </ProtectedContent>
  );
};

export default Workspace;
