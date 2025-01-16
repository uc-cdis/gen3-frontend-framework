import React, { createContext, ReactNode } from 'react';
import { WorkspaceConfig } from './types';

const WorkspaceConfigDefaults: WorkspaceConfig = {
  requirePayModel: true,
  launchStepIndicatorConfig: {
    steps: [
      { label: 'Requesting', description: 'requesting workspace resources' },
      { label: 'Initializing', description: 'starting workspace resources' },
      { label: 'Configuring', description: 'starting services' },
      {
        label: 'Starting',
        description: 'waiting for services',
      },
      {
        label: 'Connecting',
        description: 'waiting for connecting to workspace',
      },
      { label: 'Ready', description: 'workspace is ready' },
    ],
  },
};

const WorkspaceContext = createContext<WorkspaceConfig>(
  WorkspaceConfigDefaults,
);

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
  const mergedConfig = { ...WorkspaceConfigDefaults, ...config };
  return (
    <WorkspaceContext.Provider value={mergedConfig}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceProvider;
