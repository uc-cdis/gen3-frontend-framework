import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  useHatcheryOptionsQuery,
  useHatcheryStatusQuery,
  useLaunchHatcheryWorkspaceMutation,
  useTerminateHatcheryWorkspaceMutation,
} from '@/core/hatcheryApi';

export type MicroContainerStatus =
  | 'unknown'
  | 'not-running'
  | 'launching'
  | 'running'
  | 'terminating'
  | 'error';

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

const POLL_INTERVALS = {
  'not-running': 0, // stopped — no traffic
  launching: 5_000, // fast — user is waiting
  running: 30_000, // slow — just drift-check
  terminating: 5_000, // fast — waiting for pod deletion
  error: 0, // stopped on confirmed failure
  unknown: 10_000, // initial probe
} as const;

const MicroContainerProviderContext = createContext<MicroContainerContextValue>(
  {
    status: 'unknown',
    containerHash: null,
    lastError: null,
    launch: () => Promise.resolve(),
    terminate: () => Promise.resolve(),
  },
);

export const useMicoContainerContext = () => {
  const context = React.useContext(MicroContainerProviderContext);
  if (context === undefined) {
    throw Error(
      'MicroContainer must  be used inside of a useMicoContainerContext',
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
  const [status, setStatus] = useState<MicroContainerStatus>('unknown');
  const [containerHash, setContainerHash] = useState<string | null>(null);

  const tag =
    identifierTag ?? (process.env.NEXT_PUBLIC_MICRO_CONTAINER_TAG || '');

  const {
    data: optionData,
    error: optionsError,
    isFetching: isOptionsFetching,
    isError: isOptionsError,
  } = useHatcheryOptionsQuery(tag, { skip: containerHash !== null });

  const {
    data: hatcheryStatus,
    error: statusError,
    isFetching: isStausFetching,
    isError: isStatusError,
  } = useHatcheryStatusQuery(containerHash, {
    skip: containerHash === null,
    pollingInterval: POLL_INTERVALS[status],
  });

  const [
    launchTrigger,
    { isError: isWorkspaceLaunchError, error: workspaceLaunchError },
  ] = useLaunchHatcheryWorkspaceMutation();

  const [
    terminateWorkspace,
    {
      isLoading: terminateIsLoading,
      isError: isTerminateError,
      error: workspaceTerminateError,
    },
  ] = useTerminateHatcheryWorkspaceMutation();

  useEffect(() => {
    if (optionData) setContainerHash(optionData);
  }, [optionData]);

  useEffect(() => {
    if (hatcheryStatus)
      setStatus((hatcheryStatus ?? 'unknown') as MicroContainerStatus);
  }, [hatcheryStatus]);

  const updateStatus = useCallback((s: MicroContainerStatus) => {
    setStatus(s);
  }, []);

  const lastError = useMemo(
    () => optionsError ?? statusError,
    [optionsError, statusError],
  );

  const launch = useCallback(async (): Promise<void> => {
    if (
      !enabled ||
      hatcheryStatus === 'launching' ||
      hatcheryStatus === 'running'
    )
      return;

    updateStatus('launching');

    try {
      const hash = containerHash;

      const query = hash ? `?id=${encodeURIComponent(hash)}` : '';
      const res = await launchTrigger(query);
      if (!res.data) {
      }
      // Status will resolve to 'running' on the next poll
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      updateStatus('error');
    }
  }, [
    enabled,
    updateStatus,
    containerHash,
    fetchOptions,
    hatcheryBaseUrl,
    jwt,
  ]);

  const value = useMemo(
    () => ({
      status,
      containerHash,
      lastError,
      launch: () => Promise.resolve(),
      terminate: () => Promise.resolve(),
    }),
    [containerHash, lastError, status],
  );

  return (
    <MicroContainerProviderContext.Provider value={value}>
      {children}
    </MicroContainerProviderContext.Provider>
  );
}
