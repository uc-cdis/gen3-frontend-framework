import WorkspacePanel from './WorkspacePanel';
import WorkspaceNotebook from './WorkspaceNotebook';
import React from 'react';
import { useWorkspaceStatusContext } from './WorkspaceStatusProvider';
import ExternalLoginsStatus from './ExternalLogins/ExternalLoginsStatus';
import PaymentPanel from './PaymentPanel/PaymentPanel';
import WorkspaceLaunchProgress from './WorkspaceLaunchProgress';
import { useWorkspaceContext } from './WorkspaceProvider';
import StatusAndControls from './StatusAndControls';

const FULLSCREEN_STYLE =
  'fixed top-0 left-0 w-full h-full flex flex-col flex-grow content-center items-center bg-base-lightest';

const WorkspaceNotebookPanelWithControls = () => {
  const { isFullscreen } = useWorkspaceStatusContext();
  const { requirePayModel } = useWorkspaceContext();

  return (
    <div
      className={
        isFullscreen
          ? FULLSCREEN_STYLE
          : 'flex flex-col grow w-full h-full relative'
      }
    >
      <ExternalLoginsStatus />
      <div
        className={`flex w-full p-2 ${requirePayModel ? 'justify-between' : 'justify-end'}`}
      >
        {requirePayModel && <PaymentPanel />}
        <StatusAndControls />
      </div>
      <WorkspaceLaunchProgress />
      <WorkspacePanel />
      <WorkspaceNotebook />
    </div>
  );
};

export default WorkspaceNotebookPanelWithControls;
