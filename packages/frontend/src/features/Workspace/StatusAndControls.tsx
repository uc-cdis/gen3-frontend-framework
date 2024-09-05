import React from 'react';
import {
  ActionIcon,
  Button,
  Group,
  Text,
  Tooltip,
  Transition,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { FaRegStopCircle as StopIcon } from 'react-icons/fa';
import { BsArrowsFullscreen as FullscreenIcon } from 'react-icons/bs';
import { Icon } from '@iconify/react';
import { useWorkspaceStatusContext } from './WorkspaceStatusProvider';
import {
  isWorkspaceRunningOrStopping,
  selectActiveWorkspaceStatus,
  selectRequestedWorkspaceStatus,
  useCoreSelector,
} from '@gen3/core';

const StatusAndControls = () => {
  const { stopWorkspace, toggleFullscreen, isFullscreen } =
    useWorkspaceStatusContext();

  const openModal = () =>
    modals.openConfirmModal({
      title: 'Workspace',
      children: <Text size="sm">Please confirm workspace shutdown</Text>,
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onConfirm: () => stopWorkspace(),
    });

  const workspaceStatus = useCoreSelector(selectActiveWorkspaceStatus);
  const requestedStatus = useCoreSelector(selectRequestedWorkspaceStatus);

  return (
    <Transition
      mounted={isWorkspaceRunningOrStopping(workspaceStatus)}
      transition="fade"
      duration={1200}
      timingFunction="ease"
    >
      {(styles) => (
        <div style={styles}>
          <Group>
            <Icon height={'2.0rem'} icon={'workspace:jupyter'} />
            <Tooltip label="Stop Workspace">
              <Button
                loading={requestedStatus === 'Terminating'}
                size="md"
                color="accent.5"
                variant="default"
                onClick={() => {
                  openModal();
                }}
                aria-label="Stop Workspace"
                leftSection={
                  <StopIcon
                    color="utility.2"
                    size="1rem"
                    className="text-accent-warm"
                  />
                }
              >
                Stop Workspace
              </Button>
            </Tooltip>
            <Tooltip label="Toggle fullscreen mode">
              <Button
                color="utility.2"
                size="md"
                variant="default"
                onClick={() => {
                  toggleFullscreen();
                }}
                aria-label={
                  isFullscreen ? 'Exit Fullscreen' : 'Make Fullscreen'
                }
                leftSection={<FullscreenIcon className="text-accent-warm" />}
              >
                {isFullscreen ? 'Exit Fullscreen' : 'Make Fullscreen'}
              </Button>
            </Tooltip>
          </Group>
        </div>
      )}
    </Transition>
  );
};

export default StatusAndControls;
