import React, { useCallback } from 'react';
import { ActionIcon, Badge, Button, Group, Stack, Text } from '@mantine/core';
import { Icon } from '@iconify-icon/react';
import { TierToolbarConfiguration } from '../Tiers/types';
import {
  CoreState,
  selectActiveWorkspaceStatus,
  selectWorkspaceFullscreen,
  selectWorkspaceTier,
  setWorkspaceFullscreen,
  setWorkspaceTier,
  useCoreDispatch,
  useCoreSelector,
} from '@gen3/core';

import { WorkspaceTier } from '../../types';
import { useDisclosure } from '@mantine/hooks';
import { useTerminateHatcheryWorkspaceMutation } from '../../core/hatcheryApi';

interface WorkspaceToolbarProps {
  toolbarConfiguration?: TierToolbarConfiguration;
}

const WorkspaceToolbar = ({ toolbarConfiguration }: WorkspaceToolbarProps) => {
  const workspaceTier = useCoreSelector(
    (state: CoreState) => selectWorkspaceTier(state) as WorkspaceTier | null,
  );

  const workspaceStatus = useCoreSelector((state: CoreState) =>
    selectActiveWorkspaceStatus(state),
  );

  const selectFullscreenStatus = useCoreSelector((state: CoreState) =>
    selectWorkspaceFullscreen(state),
  );
  const [toolsExpanded, { toggle: toggleTools }] = useDisclosure(true);
  const [terminateWorkspace] = useTerminateHatcheryWorkspaceMutation();
  const { showStatus, showStop } = toolbarConfiguration || {};

  const coreDispatch = useCoreDispatch();

  const toggleFullscreen = useCallback(() => {
    coreDispatch(setWorkspaceFullscreen(!selectFullscreenStatus));
  }, [coreDispatch, selectFullscreenStatus]);

  const returnToWorkspaceSelection = () => {
    coreDispatch(setWorkspaceTier(null));
  };

  return (
    <div className="flex items-center justify-between px-4 border-b-2 border-base-lighter pb-4 mb-2">
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
              {workspaceStatus as string}
            </Badge>
          </Group>
        )}
        {showStop && (
          <Button
            size="sm"
            variant="outline"
            aria-label="Stop workspace"
            color="primary.5"
            onClick={() => {}}
            rightSection={<Icon icon="gen3:stop" width="100%" height="100%" />}
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
          rightSection={<Icon icon="gen3:stop" width="100%" height="100%" />}
        >
          Make Fullscreen
        </Button>
      </div>
    </div>
  );
};

export default WorkspaceToolbar;
