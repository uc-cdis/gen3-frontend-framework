import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseJupyterReadyReturn {
  /** True once the Jupyter Server inside the pod responds with HTTP 200. */
  ready: boolean;
  /** True while actively probing. */
  checking: boolean;
  /** True if the 120-second probe window expired before readiness. */
  timedOut: boolean;
}

const PROBE_INTERVAL_MS = 3_000;
const PROBE_TIMEOUT_MS = 120_000;

/**
 * Probes the Jupyter Server health endpoint via the kernel lifecycle proxy.
 *
 * Problem: Hatchery /status = "Running" means the pod is Running, NOT that
 * the Jupyter process inside has finished starting. Kernel API calls during
 * this window return 502. This hook gates the iframe and lifecycle panel.
 *
 * Polls GET /api/workspace/kernel/api/status at 3s intervals until:
 *   - HTTP 200 → ready = true, polling stops.
 *   - 120s elapsed → timedOut = true, polling stops (surface recoverable error).
 *
 * Only active when enabled === true (should be wired to useMicroContainer.status === 'running').
 */
export function useJupyterReady({
  enabled,
  kernelBaseUrl = '/api/workspace/kernel',
  jwt,
}: {
  /** Pass true when the micro container status === 'running'. */
  enabled: boolean;
  /** Base URL of the kernel lifecycle proxy. Default: /api/workspace/kernel */
  kernelBaseUrl?: string;
  jwt?: string;
}): UseJupyterReadyReturn {
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const mountedRef = useRef(true);
  const startedRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const probe = useCallback(async (): Promise<void> => {
    if (!mountedRef.current) return;

    // Check timeout
    const elapsed =
      startedRef.current != null ? Date.now() - startedRef.current : 0;
    if (elapsed >= PROBE_TIMEOUT_MS) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (mountedRef.current) {
        setTimedOut(true);
        setChecking(false);
      }
      return;
    }

    try {
      const headers: Record<string, string> = {};
      if (jwt) headers['Authorization'] = `Bearer ${jwt}`;

      const res = await fetch(`${kernelBaseUrl}/api/status`, {
        credentials: 'include',
        headers,
      });

      if (!mountedRef.current) return;

      if (res.ok) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setReady(true);
        setChecking(false);
      }
      // Non-200: server not ready yet — keep polling
    } catch {
      // Network error — keep polling until timeout
    }
  }, [kernelBaseUrl, jwt]);

  useEffect(() => {
    mountedRef.current = true;

    if (!enabled) {
      // Reset when disabled (container stopped or not running)
      setReady(false);
      setChecking(false);
      setTimedOut(false);
      startedRef.current = null;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start probing
    setReady(false);
    setTimedOut(false);
    setChecking(true);
    startedRef.current = Date.now();

    // First probe immediately
    void probe();

    intervalRef.current = setInterval(() => {
      void probe();
    }, PROBE_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, probe]);

  return { ready, checking, timedOut };
}
