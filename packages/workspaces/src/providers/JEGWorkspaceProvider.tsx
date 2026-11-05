import React, { createContext, ReactNode } from 'react';
import {
  selectJEGActiveWorkspaceStatus,
  useCoreSelector,
  WorkspaceStatus,
} from '@gen3/core';
import { JEGWorkspaceContextValue } from './types';
import { useJEGWorkspaceResourceMonitor } from './useJEGWorkspaceResourceMonitor';

const JEGWorkspaceProviderContext = createContext<JEGWorkspaceContextValue>({
  status: WorkspaceStatus.NotFound,
  workspaceId: null,
});

export const useJEGWorkspaceContext = () => {
  const context = React.useContext(JEGWorkspaceProviderContext);
  if (context === undefined) {
    throw Error(
      'useJEGWorkspaceContext must be used inside a JEGWorkspaceProvider',
    );
  }
  return context;
};

interface JEGWorkspaceProviderProps {
  children: ReactNode;
  workspaceId: string | null;
  monitorWorkspace: boolean;
}

export function JEGWorkspaceProvider({
  children,
  workspaceId,
  monitorWorkspace,
}: JEGWorkspaceProviderProps) {
  const status = useCoreSelector(selectJEGActiveWorkspaceStatus);
  useJEGWorkspaceResourceMonitor(workspaceId, monitorWorkspace);

  return (
    <JEGWorkspaceProviderContext.Provider value={{ status, workspaceId }}>
      {children}
    </JEGWorkspaceProviderContext.Provider>
  );
}
