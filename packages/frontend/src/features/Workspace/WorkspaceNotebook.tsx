import React from 'react';
import { Group, Button, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { GEN3_WORKSPACE_API, WorkspaceStatus } from '@gen3/core';
import { useWorkspaceStatusContext } from './WorkspaceStatusProvider';

const WorkspaceNotebook = () => {
  const {
    stopWorkspace,
    workspaceStatus: { status },
  } = useWorkspaceStatusContext();

  if (status !== WorkspaceStatus.Running) return null;

  const openModal = () =>
    modals.openConfirmModal({
      title: 'Please confirm workspace shutdown',
      children: <Text size="sm">Please confirm workspace shutdown</Text>,
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onConfirm: () => stopWorkspace(),
    });

  return (
    <React.Fragment>
      <div className="flex flex-col content-center items-center">
        <iframe
          className="flex flex-grow h-screen w-full border-8"
          title="Workspace"
          src={`${GEN3_WORKSPACE_API}/proxy/`}
        />
      </div>
      <Group>
        <Button onClick={openModal}> Stop Workspace </Button>
        <Button> Full Screen</Button>
      </Group>
    </React.Fragment>
  );
};

export default WorkspaceNotebook;
