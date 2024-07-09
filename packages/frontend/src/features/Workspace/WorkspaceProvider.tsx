import React, { createContext, ReactNode } from 'react';
import { WorkspaceConfig } from './types';

interface WorkspaceProviderValue {
  config: WorkspaceConfig;
}

const WorkspaceContext = createContext<WorkspaceProviderValue>({
  config: {} as WorkspaceConfig,
});

export const useWorkspaceContext = () => {
  const context = React.useContext(WorkspaceContext);
  if (context === undefined) {
    throw Error('Workspace must be used inside of a useWorkspaceContext');
  }
  return context;
};

const WorkspaceProvider = ({
  children,
  config,
}: {
  children: ReactNode;
  config: WorkspaceConfig;
}) => {
  return (
    <WorkspaceContext.Provider value={{ config }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceProvider;
