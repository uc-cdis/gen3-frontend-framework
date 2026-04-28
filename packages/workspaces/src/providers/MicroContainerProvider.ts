import React, { createContext } from 'react';

export type MicroContainerStatus =
  | 'unknown'
  | 'not-running'
  | 'launching'
  | 'running'
  | 'terminating'
  | 'error';

export interface UseMicroContainerContextValue {
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

const POLL_INTERVALS = {
  'not-running': 0, // stopped — no traffic
  launching: 5_000, // fast — user is waiting
  running: 30_000, // slow — just drift-check
  terminating: 5_000, // fast — waiting for pod deletion
  error: 0, // stopped on confirmed failure
  unknown: 10_000, // initial probe
} as const;

const MicroContainerProviderContext =
  createContext<UseMicroContainerContextValue>({
    status: 'unknown',
    containerHash: null,
    lastError: null,
    launch: () => Promise.resolve(),
    terminate: () => Promise.resolve(),
  });

export const useMicoContainerContext = () => {
  const context = React.useContext(MicroContainerProviderContext);
  if (context === undefined) {
    throw Error(
      'MicroContainer must be used inside of a useMicoContainerContext',
    );
  }
  return context;
};
