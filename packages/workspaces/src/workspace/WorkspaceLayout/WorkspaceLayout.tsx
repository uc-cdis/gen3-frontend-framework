import React, { ReactNode } from 'react';
import { Center } from '@mantine/core';

import ToolsPanel from './ToolsPanel';
import SettingsPanel from '../../workspace/WorkspaceLayout/SettingsPanel';

interface SharedWorkspaceLayoutProps {
  onMaximize?: (maximized: boolean) => void;
  leftPanel: ReactNode;
  rightPanel?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Extra content rendered in the toolbar row, between fullscreen and Hide Tools. */
  toolbarExtra?: ReactNode;
}

const WorkspaceLayout = ({
  leftPanel,
  rightPanel,
  children,
  onMaximize,
  className,
  toolbarExtra,
}: SharedWorkspaceLayoutProps) => {
  return (
    <div className="flex w-full">
      <div className="w-1/5">
        <ToolsPanel />
      </div>
      <div className="w-3/5">
        <Center>{children}</Center>
      </div>
      <div className="w-1/5">
        <SettingsPanel />
      </div>
    </div>
  );
};
