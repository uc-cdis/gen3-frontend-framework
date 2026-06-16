import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useDoesHatcheryOptionExistsQuery,
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
  'launch-error': 0,
  stopped: 0,
  unknown: 10_000,
} as const;

export function useMicroContainer(
  tag: string,
  enabled: boolean,
): MicroContainerContextValue {
  const [status, setStatus] = useState<MicroContainerStatus>('unknown');
  const [containerHash, setContainerHash] = useState<string | null>(null);

  const { data: optionData, error: optionsError } =
    useDoesHatcheryOptionExistsQuery(tag, { skip: containerHash !== null });

  const {
    data: hatcheryStatus,
    error: statusError,
    refetch: refetchStatus,
  } = useHatcheryStatusQuery(containerHash, {
    skip: containerHash === null,
    pollingInterval: POLL_INTERVALS[status],
  });

  const [
    launchTrigger,
    { error: launchError, isError: isLaunchError, isSuccess: isLaunchSuccess },
  ] = useLaunchHatcheryWorkspaceMutation();

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

    try {
      setStatus('launching');
      const query = containerHash ? encodeURIComponent(containerHash) : '';
      const launchResults = await launchTrigger(query).unwrap();
      if (!launchResults) {
        // launch error, will show error message and then reset
        setStatus('launch-error');
      }
    } catch (_error: unknown) {
      setStatus('launch-error');
    }
    // Status will resolve to 'running' on the next poll
  }, [enabled, hatcheryStatus, containerHash, launchTrigger]);

  const terminate = useCallback(async () => {
    if (!enabled || hatcheryStatus === 'terminating') return;
    setStatus('terminating');
    const query = containerHash ? encodeURIComponent(containerHash) : '';
    terminateWorkspace(query);
    refetchStatus();
  }, [
    containerHash,
    enabled,
    hatcheryStatus,
    terminateWorkspace,
    refetchStatus,
  ]);

  const resetStatus = useCallback(() => {
    setStatus('unknown');
  }, []);

  return useMemo(
    () => ({
      status,
      containerHash,
      lastError,
      launch,
      terminate,
      resetStatus,
    }),
    [containerHash, lastError, launch, status, terminate, resetStatus],
  );
}
