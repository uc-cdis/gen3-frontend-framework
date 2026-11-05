import { useState, useSyncExternalStore } from 'react';
import { fhirApi, useCoreDispatch, type FhirSearchParams } from '@gen3/core';
import {
  backStep,
  firstPage,
  nextStep,
  retryStep,
  showsPager,
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

// One slot per tab, kept by us: RTK's cache drops unused results after a minute
export const useFhirSearch = (resource: string): FhirSearch => {
  const dispatch = useCoreDispatch();
  const [resultsByTab, setResultsByTab] = useState<
    Partial<Record<string, TabResult>>
  >({});

  const run = async ({ sent, trail, offset }: Step) => {
    // Keep the old bundle and its pager on screen under the overlay
    setResultsByTab((prev) => {
      const shown = prev[resource];
      return {
        ...prev,
        [resource]: {
          ...shown,
          sent,
          trail,
          offset,
          loading: true,
          paged: !!shown && showsPager(shown),
        },
      };
    });

    const started = performance.now();

    const request = dispatch(
      fhirApi.endpoints.searchFhirResource.initiate(sent, {
        forceRefetch: true,
      }),
    );
    let reply: ReturnType<typeof toReply>;
    try {
      const { data, error } = await request;
      reply = toReply(data, error);
    } catch (err) {
      // Don't leave the tab stuck loading. toReply() alone means "unreadable reply"
      console.error(err);
      reply = toReply();
    } finally {
      // Our state has the reply, so RTK can drop its copy
      request.unsubscribe();
    }
    const ms = Math.round(performance.now() - started);

    // A newer request on this tab wins, so drop this reply
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
