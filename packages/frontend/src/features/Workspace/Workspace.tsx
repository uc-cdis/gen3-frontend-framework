import React from 'react';
import { WorkspaceConfig } from './types';
import ProtectedContent from '../../components/Protected/ProtectedContent';
import PaymentPanel from './PaymentPanel/PaymentPanel';
import WorkspacePanel from './WorkspacePanel';
import WorkspaceProvider from './WorkspaceProvider';
import WorkspaceStatusProvider from './WorkspaceStatusProvider';

interface WorkspaceProps {
  config: WorkspaceConfig;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Workspace = ({ config }: WorkspaceProps) => {
  return (
    <ProtectedContent>
      <WorkspaceProvider config={config}>
        <WorkspaceStatusProvider>
          <div className="w-full relative">
            <PaymentPanel />
            <WorkspacePanel />
          </div>
        </WorkspaceStatusProvider>
      </WorkspaceProvider>
    </ProtectedContent>
  );
};

export default Workspace;
