import React, { createContext } from 'react';

interface GatewayConnectionStatus {
  status: string;
  message?: string;
}

const WorkspacesGatewayContext = createContext<any>(null);

export const useWorkspacesGatewayContext = () => {
  const context = React.useContext(WorkspacesGatewayContext);
  if (context === undefined) {
    throw Error(
      'useWorkspacesGatewayContext must be used inside of a WorkspacesGatewayContext',
    );
  }
  return context;
};

export const WorkspacesGatewayProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [connectionStatus, setConnectionStatus] =
    React.useState<GatewayConnectionStatus>({
      status: 'disconnected',
    });

  return (
    <WorkspacesGatewayContext.Provider
      value={{ connectionStatus, setConnectionStatus }}
    >
      {children}
    </WorkspacesGatewayContext.Provider>
  );
};

export default WorkspacesGatewayContext;
