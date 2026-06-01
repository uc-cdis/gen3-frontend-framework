import React, { createContext } from 'react';

const WorkspacesGatewayContext = createContext<any>(null);

export const useWorkspacesGatewayContext = () => {
  const context = React.useContext(WorkspacesGatewayContext);
  if (context === undefined) {
    throw Error(
      'WorkspacesGateway must be used  must be used inside of a WorkspacesGatewayContext',
    );
  }
  return context;
};
