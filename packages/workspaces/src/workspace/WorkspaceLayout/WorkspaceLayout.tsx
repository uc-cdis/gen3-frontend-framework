import React, { ReactNode } from 'react';

import SettingsPanel from '../../workspace/WorkspaceLayout/SettingsPanel';
import WorkspaceToolbar from './WorkspaceToolbar';
import { WORKSPACE_TIER_INFORMATION } from '../../config';
import { useDisclosure } from '@mantine/hooks';
import {
  CoreState,
  selectWorkspaceFullscreen,
  selectWorkspaceTier,
  useCoreSelector,
} from '@gen3/core';
import { WorkspaceTier } from '../../types';
import ToolsPanel from './ToolsPanel';

interface WorkspaceLayoutProps {
  children: ReactNode;
  className?: string;
  /** Extra content rendered in the toolbar row, between fullscreen and Hide Tools. */
  toolbarExtra?: ReactNode;
}

const WorkspaceLayout = ({
  children,
  className, // TODO: add support for className
  toolbarExtra,
}: WorkspaceLayoutProps) => {
  const workspaceTier = useCoreSelector(
    (state: CoreState) => selectWorkspaceTier(state) as WorkspaceTier | null,
  );
  const [toolsExpanded, { set: setToolsExpanded }] = useDisclosure(true);
  const [settingsExpanded, { set: setSettingsExpanded }] = useDisclosure(true);

  const isFullScreen = useCoreSelector((state) =>
    selectWorkspaceFullscreen(state),
  );

  if (!workspaceTier) return null;

  return (
    <div className="flex flex-col w-full grow">
      <WorkspaceToolbar
        toolbarConfiguration={WORKSPACE_TIER_INFORMATION[workspaceTier].toolbar}
      />
      <div className="flex w-full grow">
        <ToolsPanel
          expanded={toolsExpanded && !isFullScreen}
          setExpanded={setToolsExpanded}
        />
        {children}

        <SettingsPanel
          showKernels={
            WORKSPACE_TIER_INFORMATION[workspaceTier].settings.showKernels
          }
          expanded={settingsExpanded && !isFullScreen}
          setExpanded={setSettingsExpanded}
        />
      </div>
    </div>
  );
};

export default WorkspaceLayout;
