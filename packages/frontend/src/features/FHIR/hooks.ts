import { useState, useSyncExternalStore } from 'react';
import {
  useLazySearchFhirResourceQuery,
  type FhirSearchParams,
} from '@gen3/core';
import {
  backStep,
  firstPage,
  nextStep,
  retryStep,
  toReply,
  type Step,
  type TabResult,
} from './search';

// Nothing to subscribe to: the origin never changes
const subscribe = () => () => {};

export const useOrigin = (): string =>
  useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => '',
  );

interface FhirSearch {
  result?: TabResult;
  send: (params: FhirSearchParams) => Promise<void>;
  // Undefined when there's no such page, or while loading
  next?: () => Promise<void>;
  back?: () => Promise<void>;
  retry?: () => Promise<void>;
}

// Our own state, not RTK's cache, which drops results after a minute unused
export const useFhirSearch = (resource: string): FhirSearch => {
  const [trigger] = useLazySearchFhirResourceQuery();
  const [resultsByTab, setResultsByTab] = useState<
    Partial<Record<string, TabResult>>
  >({});

  const run = async ({ sent, trail, offset }: Step) => {
    // The old bundle stays visible under the overlay
    setResultsByTab((prev) => ({
      ...prev,
      [resource]: { ...prev[resource], sent, trail, offset, loading: true },
    }));

    const started = performance.now();
    const { data, error } = await trigger(sent);
    const ms = Math.round(performance.now() - started);
    const reply = toReply(data, error);

    // Drop a slow reply if a newer request replaced `sent`
    setResultsByTab((prev) =>
      prev[resource]?.sent !== sent
        ? prev
        : {
            ...prev,
            [resource]: { sent, trail, offset, ...reply, ms, loading: false },
          },
    );
  };

  const result = resultsByTab[resource];
  const idle = result && !result.loading ? result : undefined;
  const nextRequest = idle && nextStep(idle);
  const backRequest = idle && backStep(idle);
  const retryRequest = idle && retryStep(idle);

  return {
    result,
    send: (params) => run(firstPage(resource, params)),
    next: nextRequest && (() => run(nextRequest)),
    back: backRequest && (() => run(backRequest)),
    retry: retryRequest && (() => run(retryRequest)),
  };
};
