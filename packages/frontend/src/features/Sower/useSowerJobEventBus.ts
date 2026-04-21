import { useCallback, useEffect, useState } from 'react';
import { useLazyGetMultipleSowerJobStatusQuery } from '@gen3/core';

/**
 * Hook that sets up an event bus for components to subscribe to and fire off events
 * when an active Sower job is completed.
 */
const useSowerJobEventBus = () => {
  const [listeners, setListeners] = useState<Record<string, any>>({});
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
      setListeners((prev) => ({ ...prev, [listenerKey]: callback }));
      setPollers((prev) => new Set([...prev, ...newPollers]));
    },
    [],
  );

  /**
   * Function for component to unsubscribe to updates
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
    trigger(Array.from(pollers));
  }, [pollers, trigger]);

  useEffect(() => {
    if (statusResult.isSuccess) {
      console.log('statusResult', statusResult);
      Object.entries(statusResult.currentData || {}).map(([job, response]) => {
        console.log('job', job);
        console.log('listeners', listeners);
        if (response.status === 'Completed' || response.status === 'Failed') {
          Object.values(listeners).forEach((callback) => callback(job));
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
