import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useHatcheryOptionsQuery,
  useHatcheryStatusQuery,
  useLaunchHatcheryWorkspaceMutation,
  useTerminateHatcheryWorkspaceMutation,
} from '../core/hatcheryApi';
import { getRTKQErrorMessage } from '../utils';
import {
  MicroContainerContextValue,
  MicroContainerStatus,
} from './MicroContainerProvider';

const POLL_INTERVALS = {
  'not-running': 0,
  launching: 5_000,
  running: 30_000,
  terminating: 5_000,
  error: 0,
  unknown: 10_000,
} as const;

export function useMicroContainer(
  tag: string,
  enabled: boolean,
): MicroContainerContextValue {
  const [status, setStatus] = useState<MicroContainerStatus>('unknown');
  const [containerHash, setContainerHash] = useState<string | null>(null);

  const { data: optionData, error: optionsError } = useHatcheryOptionsQuery(
    tag,
    { skip: containerHash !== null },
  );

  const {
    data: hatcheryStatus,
    error: statusError,
    refetch: refetchStatus,
  } = useHatcheryStatusQuery(containerHash, {
    skip: containerHash === null,
    pollingInterval: POLL_INTERVALS[status],
  });

  const [launchTrigger] = useLaunchHatcheryWorkspaceMutation();

  const [terminateWorkspace] = useTerminateHatcheryWorkspaceMutation();

  useEffect(() => {
    if (optionData) setContainerHash(optionData);
  }, [optionData]);

  useEffect(() => {
    if (hatcheryStatus)
      setStatus((hatcheryStatus ?? 'unknown') as MicroContainerStatus);
  }, [hatcheryStatus]);

  const lastError = useMemo(() => {
    if (!optionsError && !statusError) return null;
    let errorStr = '';
    if (optionsError) errorStr += getRTKQErrorMessage(optionsError);
    if (statusError) errorStr += getRTKQErrorMessage(statusError);
    return errorStr;
  }, [optionsError, statusError]);

  const launch = useCallback(async (): Promise<void> => {
    if (
      !enabled ||
      hatcheryStatus === 'launching' ||
      hatcheryStatus === 'running'
    )
      return;

    setStatus('launching');
    const query = containerHash
      ? `?id=${encodeURIComponent(containerHash)}`
      : '';
    const res = await launchTrigger(query);
    if (!res.data || res?.error) {
      setStatus('error');
    }
    // Status will resolve to 'running' on the next poll
  }, [enabled, hatcheryStatus, containerHash, launchTrigger]);

  const terminate = useCallback(async () => {
    if (!enabled || hatcheryStatus === 'terminating') return;
    setStatus('terminating');
    const query = containerHash
      ? `?id=${encodeURIComponent(containerHash)}`
      : '';
    terminateWorkspace(query);
    refetchStatus();
  }, [
    containerHash,
    enabled,
    hatcheryStatus,
    terminateWorkspace,
    refetchStatus,
  ]);

  return useMemo(
    () => ({ status, containerHash, lastError, launch, terminate }),
    [containerHash, lastError, launch, status, terminate],
  );
}
