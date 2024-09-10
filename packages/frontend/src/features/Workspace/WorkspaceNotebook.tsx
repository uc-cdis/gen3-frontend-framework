import React from 'react';
import {
  GEN3_WORKSPACE_API,
  selectActiveWorkspaceStatus,
  useCoreSelector,
  WorkspaceStatus,
} from '@gen3/core';

const WorkspaceNotebook = () => {
  const currentWorkspaceStatus = useCoreSelector(selectActiveWorkspaceStatus);

  if (currentWorkspaceStatus !== WorkspaceStatus.Running) return null;

  return (
    <React.Fragment>
      <div className="flex flex-col w-full  flex-grow content-center items-center">
        <iframe
          className="w-full h-full border-8"
          title="Workspace"
          src={`${GEN3_WORKSPACE_API}/proxy/`}
        />
      </div>
    </React.Fragment>
  );
};

export default WorkspaceNotebook;
