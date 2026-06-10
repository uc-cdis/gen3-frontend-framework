import React, { ReactNode } from 'react';

import ToolsPanel from './ToolsPanel';
import SettingsPanel from '../../workspace/WorkspaceLayout/SettingsPanel';
import WorkspaceToolbar from './WorkspaceToolbar';
import { WORKSPACE_TIER_INFORMATION } from '../../config';
import { Collapse } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CoreState, selectWorkspaceTier, useCoreSelector } from '@gen3/core';
import { WorkspaceTier } from '../../types';

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

  if (!workspaceTier) return null;

  return (
    <div className="flex flex-col w-full grow">
      <WorkspaceToolbar
        toolbarConfiguration={WORKSPACE_TIER_INFORMATION[workspaceTier].toolbar}
      />
      <div className="flex w-full grow">
        <Collapse expanded={toolsExpanded} onChange={toggleTools}>
          <ToolsPanel />
        </Collapse>
        {children}
        <div className="w-1/5">
          <SettingsPanel
            {...WORKSPACE_TIER_INFORMATION[workspaceTier].settings}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
