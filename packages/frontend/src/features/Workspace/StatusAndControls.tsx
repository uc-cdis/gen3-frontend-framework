import React from 'react';
import { ActionIcon, Group, Text, Tooltip, Transition } from '@mantine/core';
/// import { useDebouncedValue } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { FaRegStopCircle as StopIcon } from 'react-icons/fa';
import { BsArrowsFullscreen as FullscreenIcon } from 'react-icons/bs';
import { Icon } from '@iconify/react';
import { useWorkspaceStatusContext } from './WorkspaceStatusProvider';
import {
  selectActiveWorkspaceStatus,
  useCoreSelector,
  WorkspaceStatus,
} from '@gen3/core';

const StatusAndControls = () => {
  const {
    isActive,
    stopWorkspace,
    toggleFullscreen,
    terminateIsLoading,
    workspaceStatus: { status },
  } = useWorkspaceStatusContext();

  const openModal = () =>
    modals.openConfirmModal({
      title: 'Workspace',
      children: <Text size="sm">Please confirm workspace shutdown</Text>,
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onConfirm: () => stopWorkspace(),
    });

  // const [isTerminating] = useDebouncedValue(
  //   terminateIsLoading || status === WorkspaceStatus.Terminating,
  //   600,
  // );

  const workspaceStatus = useCoreSelector(selectActiveWorkspaceStatus);

  // if (!isActive) return null;

  return (
    <Transition
      mounted={isActive}
      transition="fade"
      duration={1200}
      timingFunction="ease"
    >
      {(styles) => (
        <div style={styles}>
          <Group>
            <Icon height={'2.0rem'} icon={'workspace:jupyter'} />
            <Tooltip label="Stop Workspace">
              <ActionIcon
                loading={workspaceStatus === WorkspaceStatus.Terminating}
                size="xl"
                color="accent.5"
                variant="default"
                onClick={() => {
                  openModal();
                }}
                aria-label="Stop Workspace"
              >
                <StopIcon
                  color="utility.2"
                  size="1.75rem"
                  className="text-accent-warm"
                />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Toggle fullscreen mode">
              <ActionIcon
                color="utility.2"
                size="xl"
                variant="default"
                onClick={() => {
                  toggleFullscreen();
                }}
                aria-label="Toggle Fullscreen"
              >
                <FullscreenIcon size="1.75rem" className="text-accent-warm" />
              </ActionIcon>
            </Tooltip>
          </Group>
        </div>
      )}
    </Transition>
  );
};

export default StatusAndControls;
