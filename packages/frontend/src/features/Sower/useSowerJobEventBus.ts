import { useCallback, useEffect, useRef, useState } from 'react';
import { useLazyGetMultipleSowerJobStatusQuery } from '@gen3/core';

/**
 * Hook that sets up an event bus for components to subscribe to and fire off events
 * when an active Sower job is completed.
 */
const useSowerJobEventBus = () => {
  const listenersRef = useRef<Record<string, (uid: string) => void>>({});
  const [pollers, setPollers] = useState<Set<string>>(new Set());
  const [trigger, statusResult] = useLazyGetMultipleSowerJobStatusQuery({
    pollingInterval: 10000,
    skipPollingIfUnfocused: true,
  });

  /**
   * Function for component to subscribe to sower job updates
   * @param listenerKey unique key for component
   * @param newPollers list of jobs to poll the status of
   * @param callback function to call when a job completes
   */
  const on = useCallback(
    (
      listenerKey: string,
      newPollers: string[],
      callback: (uid: string) => void,
    ) => {
      listenersRef.current = {
        ...listenersRef.current,
        [listenerKey]: callback,
      };
      // Only create a new Set (and thus trigger a re-render/re-poll) when the
      // set of polled jobs actually changes, otherwise this effect loops forever.
      setPollers((prev) => {
        const next = new Set(prev);
        let changed = false;
        newPollers.forEach((poller) => {
          if (!next.has(poller)) {
            next.add(poller);
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    },
    [],
  );

  /**
   * Function for component to unsubscribe to updates
   * @param listenerKey unique key for component
   */
  const off = useCallback((listenerKey: string) => {
    const { [listenerKey]: _removed, ...rest } = listenersRef.current;
    listenersRef.current = rest;
  }, []);

  /**
   * Function to update the jobs that are polling
   * @param job new job to add to pollers
   */
  const update = useCallback((job: string) => {
    setPollers((prev) => (prev.has(job) ? prev : new Set(prev).add(job)));
  }, []);

  // Stable key so the polling effect only re-runs when membership changes,
  // not whenever a new (but equivalent) Set instance is created.
  const pollerKey = Array.from(pollers).sort().join(',');

  useEffect(() => {
    if (pollers.size === 0) return;
    void trigger(Array.from(pollers));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollerKey, trigger]);

  useEffect(() => {
    if (!statusResult.isSuccess) return;

    const completed = Object.entries(statusResult.currentData || {})
      .filter(([, response]) => response.status === 'Completed')
      .map(([job]) => job);

    if (completed.length === 0) return;

    completed.forEach((job) => {
      Object.values(listenersRef.current).forEach((callback) => callback(job));
    });

    // Remove completed jobs from pollers
    setPollers((prev) => {
      const next = new Set(prev);
      let changed = false;
      completed.forEach((job) => {
        if (next.delete(job)) changed = true;
      });
      return changed ? next : prev;
    });
  }, [statusResult]);

  return { on, off, update };
};

export default useSowerJobEventBus;
