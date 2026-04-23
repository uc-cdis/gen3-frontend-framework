import { useCallback, useEffect, useState } from 'react';
import { useLazyGetMultipleSowerJobStatusQuery } from '@gen3/core';
import { useDeepCompareEffect } from 'use-deep-compare';

/**
 * Hook that sets up an event bus for components to subscribe to and fire off events
 * when an active Sower job is completed.
 */
const useSowerJobEventBus = () => {
  const [listeners, setListeners] = useState<Record<string, any>>({});
  const [pollers, setPollers] = useState<Set<string>>(new Set());
  const [activePollingInterval, setActivePollingInterval] = useState(0);
  const [trigger, statusResult] = useLazyGetMultipleSowerJobStatusQuery({
    pollingInterval: activePollingInterval,
    skipPollingIfUnfocused: true,
  });

  /**
   * Function for a component to subscribe to sower job updates
   * @param listenerKey unique key for component
   * @param newPollers list of jobs to poll the status of
   * @param callback function to call when a job completes
   */

  const on = useCallback(
    (
      listenerKey: string,
      newPollers: string[],
      callback: (uid: string, status: string) => void,
    ) => {
      setListeners((prev) => ({ ...prev, [listenerKey]: callback }));
      setPollers((prev) => new Set([...prev, ...newPollers]));
    },
    [],
  );

  /**
   * Function for a component to unsubscribe to updates
   * @param listenerKey unique key for component
   */
  const off = useCallback((listenerKey: string) => {
    setListeners((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([key]) => key !== listenerKey),
      ),
    );
  }, []);

  /**
   * Function to update the jobs that are polling
   * @param job new job to add to pollers
   */
  const update = useCallback((job: string) => {
    console.log('update', job);
    setPollers((prev) => new Set([...prev, job]));
  }, []);

  useEffect(() => {
    if (pollers.size > 0) {
      setActivePollingInterval(10000);
      trigger(Array.from(pollers));
    } else {
      setActivePollingInterval(0);
    }
  }, [pollers, trigger]);

  useDeepCompareEffect(() => {
    if (statusResult.isSuccess) {
      console.log('statusResult', statusResult);
      Object.entries(statusResult.currentData || {}).map(([job, response]) => {
        console.log('job', job);
        console.log('listeners', listeners);
        console.log('pollers', pollers);
        if (
          (pollers.has(job) && response.status === 'Completed') ||
          response.status === 'Failed'
        ) {
          Object.values(listeners).forEach((callback) =>
            callback(job, response.status),
          );
          // Remove job from pollers after it has completed
          setPollers(
            (prev) => new Set([...prev].filter((poller) => poller !== job)),
          );
        }
      });
    }
  }, [listeners, statusResult]);

  return { on, off, update };
};

export default useSowerJobEventBus;
