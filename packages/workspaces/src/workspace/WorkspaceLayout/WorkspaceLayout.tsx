import React, { ReactNode, useEffect } from 'react';

import SettingsPanel from '../../workspace/WorkspaceLayout/SettingsPanel';
import WorkspaceToolbar from './WorkspaceToolbar';
import { useDisclosure, useResizeObserver } from '@mantine/hooks';
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
  const [toolbarRef, toolbarRect] = useResizeObserver<HTMLDivElement>();

  const isFullScreen = useCoreSelector((state) =>
    selectWorkspaceFullscreen(state),
  );

  useEffect(() => {
    if (isFullScreen) {
      setToolsExpanded(false);
      setSettingsExpanded(false);
    } else {
      setToolsExpanded(true);
      setSettingsExpanded(true);
    }
  }, [isFullScreen, setSettingsExpanded, setToolsExpanded]);

  if (!workspaceTier) return null;

  return (
    <div className="flex flex-col w-full grow">
      <WorkspaceToolbar
        toolbarConfiguration={tierConfiguration.toolbar}
        ref={toolbarRef}
      />
      <div
        className="flex w-full nowrap"
        style={{
          height: `calc(100% - ${toolbarRect?.height ?? 0}px`,
        }}
      >
        {tierConfiguration.dataAndTools.enabled && (
          <ToolsPanel
            expanded={toolsExpanded}
            setExpanded={setToolsExpanded}
            width={tierConfiguration.dataAndTools.width}
          />
        )}
        {children}
        <SettingsPanel
          showKernels={tierConfiguration.settings.showKernels}
          expanded={settingsExpanded}
          setExpanded={setSettingsExpanded}
          width={tierConfiguration.settings.width}
        />
      </div>
    </div>
  );
};

export default WorkspaceLayout;
