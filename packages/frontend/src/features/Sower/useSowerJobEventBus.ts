import { useEffect, useState } from 'react';
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

  const on = (
    listenerKey: string,
    newPollers: string[],
    callback: (uid: string) => void,
  ) => {
    setListeners({ ...listeners, [listenerKey]: callback });
    setPollers(new Set([...pollers, ...newPollers]));
  };

  /**
   * Function for component to unsubscribe to updates
   * @param listenerKey unique key for component
   */
  const off = (listenerKey: string) => {
    setListeners(
      Object.fromEntries(
        Object.entries(listeners).filter(([key]) => key === listenerKey),
      ),
    );
  };

  /**
   * Function to update the jobs that are polling
   * @param job new job to add to pollers
   */
  const update = (job: string) => {
    setPollers(new Set([...pollers, job]));
  };

  useEffect(() => {
    void trigger(Array.from(pollers));
  }, [pollers, trigger]);

  useEffect(() => {
    if (statusResult.isSuccess) {
      Object.entries(statusResult.currentData || {}).map(([job, response]) => {
        if (response.status === 'Completed') {
          Object.values(listeners).forEach((callback) => callback(job));
          // Remove job from pollers after it has completed
          setPollers(new Set([...pollers].filter((poller) => poller !== job)));
        }
      });
    }
  }, [statusResult, listeners, pollers]);

  return { on, off, update };
};

export default useSowerJobEventBus;
