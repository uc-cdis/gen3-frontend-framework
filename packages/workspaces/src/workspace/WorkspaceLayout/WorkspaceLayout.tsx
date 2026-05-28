import React, { ReactNode } from 'react';

import ToolsPanel from './ToolsPanel';
import SettingsPanel from '../../workspace/WorkspaceLayout/SettingsPanel';
import WorkspaceToolbar from './WorkspaceToolbar';
import { WORKSPACE_TIER_INFORMATION } from '../../workspaceConfig';
import { useWorkspaceCenterContext } from '../../workspace/WorkspaceCenterContext';

interface WorkspaceLayoutProps {
  children: ReactNode;
  className?: string;
  /** Extra content rendered in the toolbar row, between fullscreen and Hide Tools. */
  toolbarExtra?: ReactNode;
}

const WorkspaceLayout = ({
  children,
  className,
  toolbarExtra,
}: WorkspaceLayoutProps) => {
  const { workspaceTier } = useWorkspaceCenterContext();

  return (
    <div className="flex flex-col w-full grow">
      <WorkspaceToolbar
        toolbarConfiguration={WORKSPACE_TIER_INFORMATION[workspaceTier].toolbar}
      />
      <div className="flex w-full grow">
        <div className="w-1/5">
          <ToolsPanel />
        </div>
        {children}
        <div className="w-1/5">
          <SettingsPanel />
        </div>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
