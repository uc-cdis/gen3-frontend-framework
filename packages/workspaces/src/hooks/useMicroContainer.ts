import { useCallback, useEffect, useRef, useState } from 'react';
import { useDeepCompareEffect } from 'use-deep-compare';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type MicroContainerStatus =
  | 'unknown'
  | 'not-running'
  | 'launching'
  | 'running'
  | 'terminating'
  | 'error';

export type UseMicroContainerReturn = {
  /** Current lifecycle status of the micro container pod. */
  status: MicroContainerStatus;
  /** The Hatchery container hash/id matching the identifierTag (used for launch/terminate). */
  containerHash: string | null;
  /** Error message from the last operation, if any. */
  lastError: string | null;
  /** Launch the micro container. No-op if already launching or running. */
  launch: () => Promise<void>;
  /** Terminate the micro container. */
  terminate: () => Promise<void>;
};

/* ------------------------------------------------------------------ */
/*  Poll intervals (ms)                                                 */
/* ------------------------------------------------------------------ */

const POLL_INTERVALS = {
  'not-running': 0, // stopped — no traffic
  launching: 5_000, // fast — user is waiting
  running: 30_000, // slow — just drift-check
  terminating: 5_000, // fast — waiting for pod deletion
  error: 0, // stopped on confirmed failure
  unknown: 10_000, // initial probe
} as const;

/* ------------------------------------------------------------------ */
/*  Hook                                                                */
/* ------------------------------------------------------------------ */

/**
 * Manages the lifecycle of a Hatchery-hosted micro container.
 *
 * The identifierTag is read from NEXT_PUBLIC_MICRO_CONTAINER_TAG by default;
 * override via the identifierTag prop for testing.
 *
 * Adaptive polling:
 *   not-running → 0 ms (no polling — zero traffic when idle)
 *   launching   → 5 s  (fast detection of pod Running)
 *   running     → 30 s (drift-check only)
 *
 * Visibility-change handler fires an immediate status check whenever
 * the tab becomes visible (covers tab-sleep / laptop-wake drops).
 */
export function useMicroContainer({
  identifierTag,
  hatcheryBaseUrl = '/api/workspace/hatchery',
  jwt,
  enabled = true,
}: {
  identifierTag?: string;
  /** Base URL of the Hatchery proxy API route. Default: /api/workspace/hatchery */
  hatcheryBaseUrl?: string;
  jwt?: string;
  /** When false, the hook is a no-op and returns 'not-running'. */
  enabled?: boolean;
}): UseMicroContainerReturn {
  const tag =
    identifierTag ?? (process.env.NEXT_PUBLIC_MICRO_CONTAINER_TAG || '');

  const [status, setStatus] = useState<MicroContainerStatus>('unknown');
  const [containerHash, setContainerHash] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  // Track current status in a ref so poll callbacks don't close over stale values
  const statusRef = useRef<MicroContainerStatus>('unknown');
  const mountedRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Abort controllers for in-flight fetchOptions / fetchStatus requests.
  const optionsAbortRef = useRef<AbortController | null>(null);
  const statusAbortRef = useRef<AbortController | null>(null);

  const updateStatus = useCallback((s: MicroContainerStatus) => {
    statusRef.current = s;
    if (mountedRef.current) setStatus(s);
  }, []);

  /* ── Fetch /options once to resolve containerHash ── */
  const fetchOptions = useCallback(async (): Promise<string | null> => {
    if (!tag) return null;
    optionsAbortRef.current?.abort();
    const controller = new AbortController();
    optionsAbortRef.current = controller;
    try {
      const res = await fetch(`${hatcheryBaseUrl}/options`, {
        signal: controller.signal,
        credentials: 'include',
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
      });
      if (!res.ok) return null;
      // Hatchery /options returns an array of container specs
      const options = (await res.json()) as Array<{
        name?: string;
        hash?: string;
        id?: string;
      }>;
      const match = options.find((o) => o.name?.includes(tag));
      return match?.hash ?? match?.id ?? null;
    } catch (err) {
      if ((err as { name?: string }).name === 'AbortError') return null;
      return null;
    }
  }, [hatcheryBaseUrl, jwt, tag]);

  /* ── Poll /status ── */
  const fetchStatus = useCallback(async (): Promise<void> => {
    if (!mountedRef.current) return;
    statusAbortRef.current?.abort();
    const controller = new AbortController();
    statusAbortRef.current = controller;

    const hash = containerHash;
    const query = hash ? `?id=${encodeURIComponent(hash)}` : '';
    try {
      const res = await fetch(`${hatcheryBaseUrl}/status${query}`, {
        signal: controller.signal,
        credentials: 'include',
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
      });
      if (!mountedRef.current) return;
      if (!res.ok) {
        // 404 = no pod = not-running
        if (res.status === 404) {
          updateStatus('not-running');
          return;
        }
        throw new Error(`Status ${res.status}`);
      }
      const data = (await res.json()) as { status?: string };
      const raw = (data.status || '').toLowerCase();

      // While terminating, stay in that state until backend confirms gone
      if (statusRef.current === 'terminating') {
        if (raw === 'not-running' || raw === 'stopped' || raw === '') {
          updateStatus('not-running');
        }
        // else keep polling — pod still shutting down
        return;
      }

      if (raw === 'running') {
        updateStatus('running');
        setLastError(null);
      } else if (
        raw === 'launching' ||
        raw === 'pending' ||
        raw === 'starting'
      ) {
        updateStatus('launching');
      } else if (
        raw === 'not-running' ||
        raw === 'stopped' ||
        raw === 'terminated' ||
        raw === ''
      ) {
        updateStatus('not-running');
      } else if (raw === 'terminating' || raw === 'stopping') {
        // Pod is still shutting down — transition or stay in terminating, keep polling.
        updateStatus('terminating');
      } else {
        // Unknown state — treat as launching if we just launched, else not-running.
        if (statusRef.current === 'launching') {
          updateStatus('launching');
        } else {
          updateStatus('not-running');
        }
      }
    } catch (err) {
      if ((err as { name?: string }).name === 'AbortError') return;
      if (!mountedRef.current) return;
      const msg = err instanceof Error ? err.message : String(err);
      setLastError(msg);
      // Don't immediately go to error — could be a transient network issue
      if (statusRef.current !== 'launching') {
        updateStatus('not-running');
      }
    }
  }, [hatcheryBaseUrl, jwt, containerHash, updateStatus]);

  /* ── Manage poll interval based on status ── */
  const schedulePoll = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const ms = POLL_INTERVALS[statusRef.current];
    if (ms > 0) {
      intervalRef.current = setInterval(() => {
        void fetchStatus();
      }, ms);
    }
  }, [fetchStatus]);

  /* ── Initial options fetch + status check on mount ── */
  useDeepCompareEffect(() => {
    if (!enabled) return;
    mountedRef.current = true;

    void (async () => {
      const hash = await fetchOptions();
      if (mountedRef.current && hash && !containerHash) {
        setContainerHash(hash);
      }
      await fetchStatus();
      schedulePoll();
    })();

    return () => {
      mountedRef.current = false;
      optionsAbortRef.current?.abort();
      statusAbortRef.current?.abort();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [containerHash, enabled, fetchOptions, fetchStatus, schedulePoll]);

  /* ── Reschedule poll when status changes ── */
  useEffect(() => {
    if (!enabled) return;
    schedulePoll();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, status, schedulePoll]);

  /* ── Visibility-change handler: immediate status check on tab-wake ── */
  useEffect(() => {
    if (!enabled) return;
    const handler = () => {
      if (document.visibilityState === 'visible') {
        void fetchStatus();
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [enabled, fetchStatus]);

  /* ── Actions ── */

  const launch = useCallback(async (): Promise<void> => {
    if (
      !enabled ||
      statusRef.current === 'launching' ||
      statusRef.current === 'running'
    )
      return;
    setLastError(null);
    updateStatus('launching');

    try {
      const hash = containerHash || (await fetchOptions());
      if (hash && !containerHash) setContainerHash(hash);

      const query = hash ? `?id=${encodeURIComponent(hash)}` : '';
      const res = await fetch(`${hatcheryBaseUrl}/launch${query}`, {
        method: 'POST',
        credentials: 'include',
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
      });
      if (!res.ok) {
        throw new Error(`Launch failed: ${res.status} ${res.statusText}`);
      }
      // Status will resolve to 'running' on the next poll
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setLastError(msg);
      updateStatus('error');
    }
  }, [
    enabled,
    updateStatus,
    containerHash,
    fetchOptions,
    hatcheryBaseUrl,
    jwt,
  ]);

  const terminate = useCallback(async (): Promise<void> => {
    setLastError(null);
    updateStatus('terminating');

    try {
      const hash = containerHash;
      const query = hash ? `?id=${encodeURIComponent(hash)}` : '';
      const res = await fetch(`${hatcheryBaseUrl}/terminate${query}`, {
        method: 'POST',
        credentials: 'include',
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
      });
      if (!res.ok && res.status !== 404) {
        throw new Error(`Terminate failed: ${res.status} ${res.statusText}`);
      }
      // Kick off an immediate status poll rather than waiting the full 5s interval.
      void fetchStatus();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setLastError(msg);
      updateStatus('not-running');
    }
  }, [updateStatus, containerHash, hatcheryBaseUrl, jwt, fetchStatus]);

  return { status, containerHash, lastError, launch, terminate };
}
