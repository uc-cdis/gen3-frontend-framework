import React, { ReactNode } from 'react';

import ToolsPanel from './ToolsPanel';
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

const TRANSITION_DURATION = 500;
const TOOLS_PANEL_WIDTH = 300;
const SETTINGS_PANEL_WIDTH = 300;

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
  const [toolsExpanded, { toggle: toggleTools }] = useDisclosure(true);
  const [settingsExpanded, { toggle: toggleSettings }] = useDisclosure(true);

  const isFullScreen = useCoreSelector((state) =>
    selectWorkspaceFullscreen(state),
  );

  if (!workspaceTier) return null;

  return (
    <div className="flex flex-col w-full grow">
      <WorkspaceToolbar
        toolbarConfiguration={WORKSPACE_TIER_INFORMATION[workspaceTier].toolbar}
        toggleTools={toggleTools}
        toggleSettings={toggleSettings}
      />
      <div className="flex w-full grow">
        <div
          className="overflow-hidden shrink-0"
          style={{
            width: toolsExpanded && !isFullScreen ? TOOLS_PANEL_WIDTH : 0,
            transition: `width ${TRANSITION_DURATION}ms ease`,
          }}
        >
          <div style={{ width: TOOLS_PANEL_WIDTH }}>
            <ToolsPanel />
          </div>
        </div>
        {children}
        <div
          className="overflow-hidden shrink-0"
          style={{
            width: settingsExpanded && !isFullScreen ? SETTINGS_PANEL_WIDTH : 0,
            transition: `width ${TRANSITION_DURATION}ms ease`,
          }}
        >
          <div style={{ width: SETTINGS_PANEL_WIDTH }}>
            <SettingsPanel
              {...WORKSPACE_TIER_INFORMATION[workspaceTier].settings}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
