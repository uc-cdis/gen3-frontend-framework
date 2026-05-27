import React, { ReactNode } from 'react';

import ToolsPanel from './ToolsPanel';
import SettingsPanel from '../../workspace/WorkspaceLayout/SettingsPanel';
import WorkspaceToolbar from '../../components/WorkspaceToolbar';

interface SharedWorkspaceLayoutProps {
  onMaximize?: (maximized: boolean) => void;
  children: ReactNode;
  className?: string;
  /** Extra content rendered in the toolbar row, between fullscreen and Hide Tools. */
  toolbarExtra?: ReactNode;
}

const WorkspaceLayout = ({
  children,
  onMaximize,
  className,
  toolbarExtra,
}: SharedWorkspaceLayoutProps) => {
  return (
    <div className="flex flex-col w-full grow">
      <WorkspaceToolbar />
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
