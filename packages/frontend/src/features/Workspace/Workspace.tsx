import React from 'react';
import { WorkspaceConfig } from './types';
import WorkspaceProvider from './WorkspaceProvider';
import WorkspaceStatusProvider from './WorkspaceStatusProvider';
import WorkspaceNotebookPanelWithControls from './WorkspaceNotebookPanelWithControls';

interface WorkspaceProps {
  config: WorkspaceConfig;
  workspaceToRunId?: string;
}

const Workspace = ({ config, workspaceToRunId }: WorkspaceProps) => {
  return (
      <WorkspaceProvider config={config}>
        <WorkspaceStatusProvider>
          <div className="flex flex-col grow w-full relative">
            <WorkspaceNotebookPanelWithControls id={workspaceToRunId} />
          </div>
        </WorkspaceStatusProvider>
      </WorkspaceProvider>
  );
};

export default Workspace;
