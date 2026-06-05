import React, { createContext, ReactNode } from 'react';
import { useMicroContainer } from './useMicroContainer';

export type MicroContainerStatus =
  | 'unknown'
  | 'not-running'
  | 'launching'
  | 'running'
  | 'terminating'
  | 'error'
  | 'stopped';

export interface MicroContainerContextValue {
  /** Current lifecycle status of the micro container pod. */
  status: MicroContainerStatus;
  /** The Hatchery container hash/id matching the identifierTag (used for launch/terminate). */
  containerHash: string | null;
  /** Error message from the last operation, if any. */
  lastError: string | null;
  /** Launch the micro container. No-op if already launching or running. */
  launch: () => Promise<void>;
  /** Terminate the micro container. */
  terminate: () => Promise<void>;
}

const MicroContainerProviderContext = createContext<MicroContainerContextValue>(
  {
    status: 'unknown',
    containerHash: null,
    lastError: null,
    launch: () => Promise.resolve(),
    terminate: () => Promise.resolve(),
  },
);

export const useMicroContainerContext = () => {
  const context = React.useContext(MicroContainerProviderContext);
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

export function MicroContainerProvider({
  children,
  identifierTag,
  enabled,
}: MicroContainerProviderProps) {
  const tag =
    identifierTag ?? (process.env.NEXT_PUBLIC_MICRO_CONTAINER_TAG || '');
  const value = useMicroContainer(tag, enabled);

  return (
    <MicroContainerProviderContext.Provider value={value}>
      {children}
    </MicroContainerProviderContext.Provider>
  );
}
