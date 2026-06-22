import React, { createContext, ReactNode } from 'react';
import { useMicroContainerRedux } from './useMicroContainerRedux';
import { WorkspaceStatus } from '@gen3/core';
import { MicroContainerReduxContextValue } from './types';
import { useJEGWorkspaceResourceMonitor } from './useJEGWorkspaceResourceMonitor';

const MicroContainerReduxProviderContext =
  createContext<MicroContainerReduxContextValue>({
    status: WorkspaceStatus.NotFound,
    containerHash: null,
    launch: () => Promise.resolve(),
    terminate: () => Promise.resolve(),
  });

export const useMicroContainerReduxContext = () => {
  const context = React.useContext(MicroContainerReduxProviderContext);
  if (context === undefined) {
    throw Error(
      'useMicroContainerContext must be used inside a MicroContainerProvider',
    );
  }
  return context;
};

interface MicroContainerProviderProps {
  children: ReactNode;
  identifierTag?: string;
  enabled: boolean;
}

export function MicroContainerReduxProvider({
  children,
  identifierTag,
  enabled,
}: MicroContainerProviderProps) {
  const tag =
    identifierTag ?? (process.env.NEXT_PUBLIC_MICRO_CONTAINER_TAG || '');

  const value = useMicroContainerRedux(tag, enabled);
  useJEGWorkspaceResourceMonitor(value.containerHash, true);

  return (
    <MicroContainerReduxProviderContext.Provider value={value}>
      {children}
    </MicroContainerReduxProviderContext.Provider>
  );
}
