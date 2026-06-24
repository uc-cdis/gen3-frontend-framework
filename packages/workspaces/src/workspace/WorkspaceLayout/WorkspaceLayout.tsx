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

const TRANSITION_DURATION = 500;
const SETTINGS_PANEL_WIDTH = 300;
const MIN_PANEL_WIDTH = 64;

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
  const [toolsExpanded, { toggle: toggleTools, set: setToolsExpanded }] =
    useDisclosure(true);
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
        <ToolsPanel
          expanded={toolsExpanded && !isFullScreen}
          setExpanded={setToolsExpanded}
        />
        {children}
        <div
          className="overflow-hidden shrink-0"
          style={{
            width:
              settingsExpanded && !isFullScreen
                ? SETTINGS_PANEL_WIDTH
                : MIN_PANEL_WIDTH,
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
