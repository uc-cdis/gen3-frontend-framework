import React from 'react';
import {
  GEN3_WORKSPACE_API,
  selectActiveWorkspaceStatus,
  useCoreSelector,
  WorkspaceStatus,
} from '@gen3/core';
import { useIframeActivityForwarding } from '../../lib/session/useIframeActivity';

const WorkspaceNotebook = () => {
  const currentWorkspaceStatus = useCoreSelector(selectActiveWorkspaceStatus);
  // keeps the session alive while the user works inside the workspace frame
  const forwardActivity = useIframeActivityForwarding();

  if (currentWorkspaceStatus !== WorkspaceStatus.Running) {
    return null;
  }
  return (
    <React.Fragment>
      <div className="flex flex-col w-full h-workspace flex-grow content-center items-center">
        <iframe
          className="w-full h-full border-8"
          title="Workspace"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals allow-storage-access-by-user-activation"
          allow="clipboard-read; clipboard-write; cross-origin-isolated"
          src={`${GEN3_WORKSPACE_API}/proxy/`}
          onLoad={(e) => forwardActivity(e.currentTarget)}
        />
      </div>
    </React.Fragment>
  );
};

export default WorkspaceNotebook;
