import React, { ReactNode } from 'react';

import ToolsPanel from './ToolsPanel';
import SettingsPanel from '../../workspace/WorkspaceLayout/SettingsPanel';
import WorkspaceToolbar from './WorkspaceToolbar';
import { WORKSPACE_TIER_INFORMATION } from '../../config';
import { Collapse } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  CoreState,
  selectWorkspaceFullscreen,
  selectWorkspaceTier,
  useCoreSelector,
} from '@gen3/core';
import { WorkspaceTier } from '../../types';

const TRANSITION_DURATION = 400;

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
      />
      <div className="flex w-full grow">
        <Collapse
          expanded={toolsExpanded && !isFullScreen}
          onChange={toggleTools}
          transitionDuration={TRANSITION_DURATION}
          orientation="horizontal"
        >
          <ToolsPanel />
        </Collapse>
        {children}
        <Collapse
          expanded={settingsExpanded && !isFullScreen}
          transitionDuration={TRANSITION_DURATION}
          orientation="horizontal"
        >
          <SettingsPanel
            {...WORKSPACE_TIER_INFORMATION[workspaceTier].settings}
          />
        </Collapse>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
