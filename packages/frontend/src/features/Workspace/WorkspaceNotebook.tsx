import React from 'react';
import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { GEN3_WORKSPACE_API, WorkspaceStatus } from '@gen3/core';
import { useWorkspaceStatusContext } from './WorkspaceStatusProvider';

const WorkspaceNotebook = () => {
  const {
    stopWorkspace,
    workspaceStatus: { status },
  } = useWorkspaceStatusContext();

  if (status !== WorkspaceStatus.Running) return null;

  return (
    <React.Fragment>
      <div className="flex flex-col content-center items-center">
        <iframe
          className="flex flex-grow h-screen w-full border-8"
          title="Workspace"
          src={`${GEN3_WORKSPACE_API}/proxy/`}
        />
      </div>
    </React.Fragment>
  );
};

export default WorkspaceNotebook;
