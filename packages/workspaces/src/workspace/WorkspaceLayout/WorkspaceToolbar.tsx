import React, { forwardRef, useCallback } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
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
}

const WorkspaceToolbar = forwardRef<HTMLDivElement, WorkspaceToolbarProps>(
  ({ toolbarConfiguration }, ref) => {
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

    const fullscreenLabel = isFullscreen
      ? 'Exit Fullscreen'
      : 'Fullscreen View';
    const statusLabel =
      workspaceStatus === WorkspaceStatus.NotFound
        ? 'Not Running'
        : (workspaceStatus as string);

    return (
      <div
        ref={ref}
        role="toolbar"
        aria-label="Workspace toolbar"
        className="flex items-center justify-between px-4 border-b-2 border-base-lighter pb-4"
      >
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
            <Icon
              icon="gen3:back-arrow"
              width="100%"
              height="100%"
              aria-hidden="true"
            />
          </ActionIcon>
          <Stack gap="-10px">
            <Text size="xl" c="primary.4">
              {toolbarConfiguration?.label}
            </Text>
            <Group>
              <Text size="sm">{toolbarConfiguration?.description}</Text>
              <Badge aria-label={`Workspace tier: ${workspaceTier as string}`}>
                {workspaceTier as string}
              </Badge>
            </Group>
          </Stack>
        </div>
        <div className="flex items-center gap-4 mr-8">
          {showStatus && (
            <Group gap="xs" role="status" aria-label="Workspace status">
              <Text size="md" c="base-contrast.4" aria-hidden="true">
                Workspace Status:
              </Text>
              <Badge
                size="md"
                radius="md"
                aria-live="polite"
                aria-atomic="true"
              >
                {statusLabel}
              </Badge>
            </Group>
          )}
          {showStop && (
            <Button
              size="sm"
              variant={
                workspaceStatus !== WorkspaceStatus.Running
                  ? 'outline'
                  : 'filled'
              }
              aria-label="Stop workspace"
              aria-disabled={workspaceStatus !== WorkspaceStatus.Running}
              color={
                workspaceStatus !== WorkspaceStatus.Running
                  ? 'primary.5'
                  : 'utility.4'
              }
              onClick={terminate}
              disabled={workspaceStatus !== WorkspaceStatus.Running}
              leftSection={
                <Icon
                  icon="gen3:dot"
                  width={36}
                  height={36}
                  aria-hidden="true"
                  className={
                    workspaceStatus !== WorkspaceStatus.Running
                      ? 'text-primary-contrast'
                      : 'text-utility-success'
                  }
                />
              }
            >
              Stop Workspace
            </Button>
          )}
          <Tooltip label={fullscreenLabel}>
            <Button
              size="sm"
              variant="outline"
              aria-label={fullscreenLabel}
              aria-pressed={isFullscreen}
              color="primary.5"
              onClick={toggleFullscreen}
              leftSection={
                isFullscreen ? (
                  <Icon
                    icon="gen3:fullscreen-exit"
                    width={24}
                    height={24}
                    aria-hidden="true"
                  />
                ) : (
                  <Icon
                    icon="gen3:fullscreen"
                    width={24}
                    height={24}
                    aria-hidden="true"
                  />
                )
              }
            >
              {fullscreenLabel}
            </Button>
          </Tooltip>
        </div>
      </div>
    );
  },
);

WorkspaceToolbar.displayName = 'WorkspaceToolbar';

export default WorkspaceToolbar;
