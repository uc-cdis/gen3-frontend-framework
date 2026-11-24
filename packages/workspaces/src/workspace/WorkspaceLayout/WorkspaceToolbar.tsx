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
import type { TierToolbarConfiguration } from '../tiers/types';
import type { CoreState } from '@gen3/core';
import {
  selectJEGActiveWorkspaceId,
  selectJEGActiveWorkspaceStatus,
  selectWorkspaceFullscreen,
  selectWorkspaceTier,
  setWorkspaceFullscreen,
  setWorkspaceTier,
  useCoreDispatch,
  useCoreSelector,
  WorkspaceStatus,
} from '@gen3/core';
import CostTracker from '../../components/CostTracker';

import type { WorkspaceTier } from '../../types';
import { useMicroContainerReduxContext } from '../../providers/MicroContainerReduxProvider';
import { useHatcheryOptionsQuery } from '../../core/hatcheryApi';

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

    const {
      showStop,
      showWorkspaceName,
      tierLabel,
      requirePayModel,
      workspaceAccountManagerTarget,
    } = toolbarConfiguration || {};

    const coreDispatch = useCoreDispatch();

    const toggleFullscreen = useCallback(() => {
      coreDispatch(setWorkspaceFullscreen(!isFullscreen));
    }, [coreDispatch, isFullscreen]);

    const returnToWorkspaceSelection = () => {
      coreDispatch(setWorkspaceTier(null));
    };

    const { terminate } = useMicroContainerReduxContext();
    const { data: hatcheryOptions } = useHatcheryOptionsQuery();
    // id set by setJEGActiveWorkspaceId when the workspace was launched
    const activeWorkspaceId = useCoreSelector((state: CoreState) =>
      selectJEGActiveWorkspaceId(state),
    );
    // only shown when enabled with showWorkspaceName in workspaces.json and the id
    // exactly matches an option, otherwise show nothing
    const activeWorkspaceName =
      showWorkspaceName &&
      activeWorkspaceId &&
      workspaceStatus !== WorkspaceStatus.NotFound
        ? hatcheryOptions?.find((option) => option.id === activeWorkspaceId)
            ?.name
        : undefined;

    const fullscreenLabel = isFullscreen
      ? 'Exit Fullscreen'
      : 'Fullscreen View';
    const labelListForDisplay: Record<string, string> = {
      [WorkspaceStatus.Running]: 'Stop Workspace',
      [WorkspaceStatus.NotFound]: 'Not Running',
    };
    const colorsForStates: Record<string, string> = {
      [WorkspaceStatus.Launching]: 'text-utility-warning',
      [WorkspaceStatus.Running]: 'text-utility-success',
      [WorkspaceStatus.Terminating]: 'text-utility-warning',
      [WorkspaceStatus.Errored]: 'text-utility-error',
      [WorkspaceStatus.StatusError]: 'text-utility-error',
      [WorkspaceStatus.LaunchError]: 'text-utility-error',
      [WorkspaceStatus.TerminateError]: 'text-utility-error',
    };
    // use the display label when one is defined for the status, otherwise show the status as is
    const statusLabel =
      labelListForDisplay[workspaceStatus as string] ??
      (workspaceStatus as string);

    return (
      <div
        ref={ref}
        role="toolbar"
        aria-label="Workspace toolbar"
        className="flex items-center justify-between px-4 border-b-2 border-base-lighter"
      >
        <div className="flex items-center gap-2 pb-2">
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
              <Badge
                aria-label={`Workspace tier: ${tierLabel ?? (workspaceTier as string)}`}
              >
                {tierLabel ?? (workspaceTier as string)}
              </Badge>
              {requirePayModel && (
                <CostTracker
                  workspaceAccountManagerTarget={workspaceAccountManagerTarget}
                />
              )}
            </Group>
          </Stack>
        </div>
        <div className="flex items-center gap-4 mr-8">
          {activeWorkspaceName && (
            <div className="text-base-darker text-sm">
              {activeWorkspaceName}
            </div>
          )}
          {showStop && (
            <Button
              size="sm"
              variant={
                workspaceStatus !== WorkspaceStatus.Running
                  ? 'outline'
                  : 'filled'
              }
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
                    colorsForStates[workspaceStatus as string] ??
                    'text-primary-contrast'
                  }
                />
              }
            >
              {statusLabel}
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
