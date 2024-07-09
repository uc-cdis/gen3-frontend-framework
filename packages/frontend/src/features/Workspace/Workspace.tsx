import React from 'react';
import { WorkspaceConfig } from './types';
import ProtectedContent from '../../components/Protected/ProtectedContent';
import PaymentPanel from './PaymentPanel/PaymentPanel';
import WorkspacePanel from './WorkspacePanel';
import WorkspaceProvider from './WorkspaceProvider';

interface WorkspaceProps {
  config: WorkspaceConfig;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Workspace = ({ config }: WorkspaceProps) => {
  return (
    <ProtectedContent>
      <WorkspaceProvider config={config}>
        <div className="w-full relative">
          <PaymentPanel />
          <WorkspacePanel />
        </div>
      </WorkspaceProvider>
    </ProtectedContent>
  );
};

export default Workspace;
