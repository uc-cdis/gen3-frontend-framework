import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef } from 'react';
import {
  selectSowerJobList,
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
const useSowerPolling = () => {
  const dispatch = useCoreDispatch();
  const jobs = useCoreSelector(selectSowerJobList);
  const [trigger, result] = useLazyGetMultipleSowerJobStatusQuery({
    pollingInterval: 10000,
    skipPollingIfUnfocused: true,
  });

  const runningIds = jobs
    .filter((j) => j.status === SowerJobStatus.Running)
    .map((j) => j.uid);

  const pollerKey = [...runningIds].sort().join(',');

  useEffect(() => {
    if (runningIds.length === 0) return;
    void trigger(runningIds);
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
  const jobs = useCoreSelector(selectSowerJobList);
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
