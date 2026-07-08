import React, { ReactNode } from 'react';

import SettingsPanel from '../../workspace/WorkspaceLayout/SettingsPanel';
import WorkspaceToolbar from './WorkspaceToolbar';
import { useDisclosure } from '@mantine/hooks';
import {
  CoreState,
  selectWorkspaceFullscreen,
  selectWorkspaceTier,
  useCoreSelector,
} from '@gen3/core';
import { WorkspaceTier } from '../../types';
import ToolsPanel from './ToolsPanel';
import {
  FreeWorkspaceTierConfiguration,
  RemoteComputeWorkspaceTierConfiguration,
} from '../tiers/types';

interface WorkspaceLayoutProps {
  children: ReactNode;
  className?: string;
  /** Extra content rendered in the toolbar row, between fullscreen and Hide Tools. */
  toolbarExtra?: ReactNode;
  tierConfiguration:
    | FreeWorkspaceTierConfiguration
    | RemoteComputeWorkspaceTierConfiguration;
}

const WorkspaceLayout = ({
  children,
  tierConfiguration,
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
      <WorkspaceToolbar toolbarConfiguration={tierConfiguration.toolbar} />
      <div className="flex w-full grow">
        {tierConfiguration.dataAndTools.enabled && (
          <ToolsPanel
            expanded={toolsExpanded && !isFullScreen}
            setExpanded={setToolsExpanded}
            width={tierConfiguration.dataAndTools.width}
          />
        )}
        {children}
        <SettingsPanel
          showKernels={tierConfiguration.settings.showKernels}
          expanded={settingsExpanded && !isFullScreen}
          setExpanded={setSettingsExpanded}
          width={tierConfiguration.settings.width}
        />
      </div>
    </div>
  );
};

export default WorkspaceLayout;
