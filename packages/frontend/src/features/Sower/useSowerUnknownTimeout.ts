import { useEffect } from 'react';
import {
  markSowerJobsStatusStale,
  selectSowerJobsList,
  SowerJobStatus,
  useCoreDispatch,
  useCoreSelector,
} from '@gen3/core';
import { minutesToMilliseconds } from '../../utils';
import type { SowerUnknownStatusConfig } from './types';

export const DEFAULT_UNKNOWN_STATUS_TIMEOUT_MINUTES = 30;
const CHECK_INTERVAL_MS = 60 * 1000;

/**
 * Pauses polling for jobs that have been Unknown longer than the configured
 * timeout. The job stays Unknown but is flagged statusStale, and the job table
 * offers a Retry action that resumes polling.
 */
const useSowerUnknownTimeout = ({
  unknownStatusTimeoutMinutes = DEFAULT_UNKNOWN_STATUS_TIMEOUT_MINUTES,
}: SowerUnknownStatusConfig = {}) => {
  const dispatch = useCoreDispatch();
  const jobs = useCoreSelector(selectSowerJobsList);
  const hasWatchedJobs = jobs.some(
    (j) => j.status === SowerJobStatus.Unknown && !j.statusStale,
  );

  useEffect(() => {
    if (unknownStatusTimeoutMinutes <= 0 || !hasWatchedJobs) return;
    const timeoutMs = minutesToMilliseconds(unknownStatusTimeoutMinutes);

    const check = () => {
      const cutoff = Date.now() - timeoutMs;
      const staleIds = jobs
        .filter(
          (j) =>
            j.status === SowerJobStatus.Unknown &&
            !j.statusStale &&
            j.updated < cutoff,
        )
        .map((j) => j.uid);
      if (staleIds.length > 0) dispatch(markSowerJobsStatusStale(staleIds));
    };

    check();
    const id = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [dispatch, jobs, hasWatchedJobs, unknownStatusTimeoutMinutes]);
};

export default useSowerUnknownTimeout;
