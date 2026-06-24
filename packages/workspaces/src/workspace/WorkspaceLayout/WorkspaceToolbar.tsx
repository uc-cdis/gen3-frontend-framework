import React, { useCallback } from 'react';
import { ActionIcon, Badge, Button, Group, Stack, Text } from '@mantine/core';
import { Icon } from '@iconify-icon/react';
import { TierToolbarConfiguration } from '../tiers/types';
import {
  CoreState,
  selectJEGActiveWorkspaceStatus,
  selectWorkspaceFullscreen,
  selectWorkspaceTier,
  setWorkspaceFullscreen,
  setWorkspaceTier,
  useCoreDispatch,
  useCoreSelector,
  WorkspaceStatus,
} from '@gen3/core';

import { WorkspaceTier } from '../../types';
import { useMicroContainerReduxContext } from '../../providers/MicroContainerReduxProvider';

interface WorkspaceToolbarProps {
  toolbarConfiguration?: TierToolbarConfiguration;
  toggleTools: () => void;
  toggleSettings: () => void;
}

const WorkspaceToolbar = ({
  toolbarConfiguration,
  toggleTools,
  toggleSettings,
}: WorkspaceToolbarProps) => {
  const workspaceTier = useCoreSelector(
    (state: CoreState) => selectWorkspaceTier(state) as WorkspaceTier | null,
  );

  const workspaceStatus = useCoreSelector((state: CoreState) =>
    selectJEGActiveWorkspaceStatus(state),
  );

  const isFullscreen = useCoreSelector((state: CoreState) =>
    selectWorkspaceFullscreen(state),
  );

  const { showStatus, showStop } = toolbarConfiguration || {};

  const coreDispatch = useCoreDispatch();

  const toggleFullscreen = useCallback(() => {
    coreDispatch(setWorkspaceFullscreen(!isFullscreen));
  }, [coreDispatch, isFullscreen]);

  const returnToWorkspaceSelection = () => {
    coreDispatch(setWorkspaceTier(null));
  };

  const { terminate } = useMicroContainerReduxContext();

  return (
    <div className="flex flex-col px-4 border-b-2 border-base-lighter pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ActionIcon
            variant="outline"
            radius="xl"
            size="lg"
            aria-label="Back to workspace list"
            color="primary.5"
            className="mr-4"
            onClick={returnToWorkspaceSelection}
          >
            <Icon icon="gen3:back-arrow" width="100%" height="100%" />
          </ActionIcon>
          <Stack gap="-10px">
            <Text size="xl" c="primary.4">
              {toolbarConfiguration?.label}
            </Text>
            <Group>
              <Text size="sm">{toolbarConfiguration?.description}</Text>
              <Badge>{workspaceTier as string}</Badge>
            </Group>
          </Stack>
        </div>
        <div className="flex items-center gap-4 mr-8">
          {showStatus && (
            <Group gap="xs">
              <Text size="md" c="base-contrast.4">
                Workspace Status:
              </Text>
              <Badge size="md" radius="md">
                {workspaceStatus === WorkspaceStatus.NotFound
                  ? 'Not Running'
                  : (workspaceStatus as string)}
              </Badge>
            </Group>
          )}
          <Button onClick={() => toggleTools()} size="sm" variant="outline">
            Tools
          </Button>
          <Button onClick={() => toggleSettings()} size="sm" variant="outline">
            Settings
          </Button>
          {showStop && (
            <Button
              size="sm"
              variant="outline"
              aria-label="Stop workspace"
              color="primary.5"
              onClick={terminate}
              disabled={workspaceStatus !== WorkspaceStatus.Running}
              leftSection={<Icon icon="gen3:stop" width={24} height={24} />}
            >
              Stop
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            aria-label=""
            color="primary.5"
            onClick={toggleFullscreen}
            leftSection={
              isFullscreen ? (
                <Icon icon="gen3:fullscreen-exit" width={24} height={24} />
              ) : (
                <Icon icon="gen3:fullscreen" width={24} height={24} />
              )
            }
          >
            {isFullscreen ? 'Exit' : 'Enter'} Fullscreen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceToolbar;
