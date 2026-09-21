import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef } from 'react';
import {
  selectSowerJobsList,
  selectUserAuthStatus,
  SowerJobStatus,
  updateSowerJobStatus,
  useCoreDispatch,
  useCoreSelector,
  useLazyGetMultipleSowerJobStatusQuery,
  useLazyGetSowerJobListQuery,
} from '@gen3/core';
import useJobOutputAction from './useJobOutputAction';

/**
 * Polls the status of all Running jobs tracked in the sower slice and
 * dispatches updateSowerJobStatus as statuses change. This drives
 * useJobOutputAction, which fires output callbacks when jobs complete.
 */
const POLL_INTERVAL_MS = 10000;

const useSowerPolling = () => {
  const dispatch = useCoreDispatch();
  const jobs = useCoreSelector(selectSowerJobsList);
  const [trigger, result] = useLazyGetMultipleSowerJobStatusQuery();

  const runningIds = jobs
    .filter((j) => j.status === SowerJobStatus.Running)
    .map((j) => j.uid);

  const pollerKey = [...runningIds].sort((a, b) => a.localeCompare(b)).join(',');

  // Manage our own interval so polling stops immediately when there are no
  // running jobs. RTK Query's built-in pollingInterval keeps the subscription
  // alive even after the trigger list empties.
  useEffect(() => {
    if (runningIds.length === 0) return;
    void trigger(runningIds);
    const id = setInterval(() => {
      void trigger(runningIds);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollerKey, trigger]);

  useEffect(() => {
    if (!result.isSuccess || !result.currentData) return;
    for (const [uid, response] of Object.entries(result.currentData)) {
      dispatch(
        updateSowerJobStatus({
          jobId: uid,
          status: response.status as SowerJobStatus,
        }),
      );
    }
  }, [result, dispatch]);
};

/**
 * When the user (re)authenticates, fetches the server-side job list and
 * reconciles statuses for any jobs already tracked in the slice. This handles
 * page reloads and reconnects where the server may have advanced a job's
 * status while the client was away.
 */
const useSowerHydration = () => {
  const dispatch = useCoreDispatch();
  const userStatus = useCoreSelector(selectUserAuthStatus);
  const jobs = useCoreSelector(selectSowerJobsList);
  const [fetchJobList] = useLazyGetSowerJobListQuery();
  const prevStatusRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = userStatus;

    if (userStatus !== 'authenticated' || prev === 'authenticated') return;
    if (jobs.length === 0) return;

    void fetchJobList()
      .then(({ data }) => {
        if (!data) return;
        const statusMap = new Map(data.map((j) => [j.uid, j.status]));
        for (const job of jobs) {
          const apiStatus = statusMap.get(job.uid);
          if (apiStatus && apiStatus !== job.status) {
            dispatch(
              updateSowerJobStatus({ jobId: job.uid, status: apiStatus }),
            );
          }
        }
      })
      .catch(() => undefined);
    // jobs intentionally excluded: we only want this to fire on auth transition,
    // not every time a job is added.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userStatus, fetchJobList, dispatch]);
};

export const SowerProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  useSowerPolling();
  useSowerHydration();
  useJobOutputAction();
  return <>{children}</>;
};
