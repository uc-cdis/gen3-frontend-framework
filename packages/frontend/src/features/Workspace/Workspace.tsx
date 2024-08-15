import React from 'react';
import { WorkspaceConfig } from './types';
import ProtectedContent from '../../components/Protected/ProtectedContent';
import PaymentPanel from './PaymentPanel/PaymentPanel';
import WorkspacePanel from './WorkspacePanel';
import WorkspaceProvider from './WorkspaceProvider';
import WorkspaceStatusProvider from './WorkspaceStatusProvider';
import WorkspaceLaunchProgress from './WorkspaceLaunchProgress';
import WorkspaceNotebook from './WorkspaceNotebook';

interface WorkspaceProps {
  config: WorkspaceConfig;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Workspace = ({ config }: WorkspaceProps) => {
  return (
    <ProtectedContent>
      <WorkspaceProvider config={config}>
        <WorkspaceStatusProvider>
          <div className="flex flex-col grow w-full relative">
            <PaymentPanel />
            <WorkspaceLaunchProgress />
            <WorkspacePanel />
            <WorkspaceNotebook />
          </div>
        </WorkspaceStatusProvider>
      </WorkspaceProvider>
    </ProtectedContent>
  );
};

export default Workspace;
