import { useSyncExternalStore } from 'react';

// The origin never changes, so there's nothing to subscribe to
const subscribe = () => () => {};

export const useOrigin = (): string =>
  useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => '',
  );
