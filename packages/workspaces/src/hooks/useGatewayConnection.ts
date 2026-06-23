import { useCallback, useEffect, useRef, useState } from 'react';
import type { WorkspaceAuthContext } from '../auth/auth';
import type { RemoteComputeWorkspaceHandle } from '../workspace/tiers/types';
import {
  type GatewayKernel,
  launchKernelWithRetry,
  terminateKernelWithRetry,
  useKernels,
  useKernelSpecs,
} from './useGatewayApi';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type GatewayConnectionState =
  | 'idle'
  | 'launching'
  | 'attaching'
  | 'connected'
  | 'reconnecting' // transient — iframe + lifecycle panel remain visible
  | 'error'
  | 'unavailable'; // JEG not configured for this deployment — no polling, no retry

export interface UseGatewayConnectionOpts {
  gatewayBaseUrl: string;
  authContext?: WorkspaceAuthContext;
  /** Poll interval for kernel list in ms (0 = no polling). Managed adaptively internally. */
  kernelPollIntervalMs?: number;
}

export interface UseGatewayConnectionReturn {
  /** Ref to pass to <RemoteComputeWorkspace ref={...} /> */
  workspaceRef: React.RefObject<RemoteComputeWorkspaceHandle | null>;
  /** Available kernel specs from the Gateway. */
  specs: ReturnType<typeof useKernelSpecs>;
  /** Running kernels on the Gateway. */
  kernelList: ReturnType<typeof useKernels>;
  /** Overall connection state. */
  connectionState: GatewayConnectionState;
  /** The active kernel, if any. */
  activeKernel: GatewayKernel | null;
  /** Error message from the last operation. */
  lastError: string | null;
  /** Launch a kernel and attach it to the iframe. */
  launchAndAttach: (kernelName: string) => Promise<void>;
  /** Terminate the given kernel (or the active one). */
  terminate: (kernelId?: string) => Promise<void>;
  /** Trigger a manual reconnect attempt (e.g. from an onRetry button). */
  startReconnect: () => void;
}

/* ------------------------------------------------------------------ */
/*  Session persistence                                                 */
/* ------------------------------------------------------------------ */

const SESSION_KEY = 'gen3-active-kernel';

interface PersistedKernel {
  kernelId: string;
  kernelName: string;
  timestamp: number;
}

function persistKernel(kernel: GatewayKernel): void {
  try {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        kernelId: kernel.id,
        kernelName: kernel.name,
        timestamp: Date.now(),
      }),
    );
  } catch {
    /* sessionStorage unavailable (SSR, private browsing) */
  }
}

function readPersistedKernel(): PersistedKernel | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.kernelId !== 'string' ||
      typeof parsed?.kernelName !== 'string'
    )
      return null;
    return parsed as PersistedKernel;
  } catch {
    return null;
  }
}

function clearPersistedKernel(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* noop */
  }
}

/* ------------------------------------------------------------------ */
/*  Adaptive poll intervals                                             */
/* ------------------------------------------------------------------ */

const POLL_MS: Record<GatewayConnectionState, number> = {
  idle: 0,
  launching: 0,
  attaching: 0,
  connected: 30_000, // low-frequency; just drift-check
  reconnecting: 5_000, // faster detection of recovery
  error: 0,
  unavailable: 0, // JEG disabled — never poll
};

/* ------------------------------------------------------------------ */
/*  Reconnect backoff sequence (ms)                                     */
/* ------------------------------------------------------------------ */

const RECONNECT_BACKOFF = [2_000, 4_000, 8_000, 16_000, 30_000];

/* ------------------------------------------------------------------ */
/*  Hook                                                                */
/* ------------------------------------------------------------------ */

export function useGatewayConnection({
  gatewayBaseUrl,
  authContext,
  kernelPollIntervalMs = 5000,
}: UseGatewayConnectionOpts): UseGatewayConnectionReturn {
  const jwt = authContext?.jwt;
  const workspaceRef = useRef<RemoteComputeWorkspaceHandle | null>(null);

  const [connectionState, setConnectionState] =
    useState<GatewayConnectionState>('idle');
  const [activeKernel, setActiveKernel] = useState<GatewayKernel | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [kernelPollMs, setKernelPollMs] = useState<number>(0);

  // Refs that must survive renders without triggering them
  const stateRef = useRef<GatewayConnectionState>('idle');
  const ownedKernelIds = useRef<Set<string>>(new Set());
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guards async callbacks (reconnect loop, session restore) after unmount.
  const mountedRef = useRef(true);
  // AbortController for the currently in-flight reconnect probe fetch.
  const reconnectAbortRef = useRef<AbortController | null>(null);

  const specs = useKernelSpecs(gatewayBaseUrl, jwt);
  const rawKernelList = useKernels(gatewayBaseUrl, jwt, kernelPollMs);

  // Show all kernels JEG returns — JEG already isolates by REMOTE_USER/KERNEL_USERNAME.
  // ownedKernelIds is still maintained for activeKernel tracking and reconnect logic,
  // but NOT used as a display filter (which caused the panel to show nothing after refresh).
  const kernelList = rawKernelList;

  const setGatewayState = useCallback((s: GatewayConnectionState) => {
    stateRef.current = s;
    setConnectionState(s);
    setKernelPollMs(POLL_MS[s]);
  }, []);

  /* ── Reconnect sequence ─────────────────────────────────────────── */

  const startReconnect = useCallback(() => {
    if (stateRef.current === 'reconnecting') return; // already in progress
    if (stateRef.current === 'unavailable') return; // JEG disabled — never retry
    reconnectAttemptsRef.current = 0;
    setGatewayState('reconnecting');

    const attempt = () => {
      if (!ownedKernelIds.current.size) {
        // Nothing to reconnect to — give up
        setGatewayState('error');
        return;
      }

      const idx = Math.min(
        reconnectAttemptsRef.current,
        RECONNECT_BACKOFF.length - 1,
      );
      const delay = RECONNECT_BACKOFF[idx];
      reconnectTimerRef.current = setTimeout(async () => {
        reconnectAttemptsRef.current += 1;
        // Cancel any previous in-flight probe and start a new one.
        reconnectAbortRef.current?.abort();
        const controller = new AbortController();
        reconnectAbortRef.current = controller;
        try {
          // Verify the kernel is still alive
          const url = `${gatewayBaseUrl.replace(/\/$/, '')}/api/kernels`;
          const res = await fetch(url, {
            signal: controller.signal,
            credentials: 'include',
            headers: jwt
              ? {
                  Authorization: `Bearer ${jwt}`,
                  'Content-Type': 'application/json',
                }
              : { 'Content-Type': 'application/json' },
          });
          if (res.ok) {
            const kernels = (await res.json()) as GatewayKernel[];
            if (!mountedRef.current) return;
            const ours = kernels.find((k) => ownedKernelIds.current.has(k.id));
            if (ours) {
              // Recovered
              reconnectAttemptsRef.current = 0;
              setActiveKernel(ours);
              setGatewayState('connected');
              void rawKernelList.refetch();
              return;
            }
          }
        } catch (err) {
          if ((err as { name?: string }).name === 'AbortError') return;
          /* network down — keep retrying */
        }

        if (!mountedRef.current) return;
        if (reconnectAttemptsRef.current >= RECONNECT_BACKOFF.length) {
          // Max retries exceeded
          clearPersistedKernel();
          setGatewayState('error');
          return;
        }
        attempt(); // schedule next retry
      }, delay);
    };

    attempt();
  }, [gatewayBaseUrl, jwt, rawKernelList, setGatewayState]);

  /* ── Pre-flight JEG status check ────────────────────────────────── */
  // On mount, check /api/status to see if JEG is configured for this deployment.
  // If { enabled: false }, transition to 'unavailable' and stop all polling.
  // This prevents error spam when JEG is not set up.
  useEffect(() => {
    if (kernelPollIntervalMs === 0) return; // polling disabled externally — no need to check

    const controller = new AbortController();
    const check = async () => {
      try {
        const res = await fetch(
          `${gatewayBaseUrl.replace(/\/$/, '')}/api/status`,
          {
            signal: controller.signal,
            credentials: 'include',
            headers: jwt
              ? {
                  Authorization: `Bearer ${jwt}`,
                  'Content-Type': 'application/json',
                }
              : { 'Content-Type': 'application/json' },
          },
        );
        if (!res.ok) return; // server error — let normal reconnect handle it
        const data = (await res.json()) as { enabled?: boolean };
        if (data.enabled === false) {
          setGatewayState('unavailable');
        }
      } catch {
        // Network error or aborted — not a definitive disabled signal, skip
      }
    };
    void check();
    return () => controller.abort();
  }, [gatewayBaseUrl, jwt, kernelPollIntervalMs, setGatewayState]); // Only re-run if the base URL changes

  /* ── Watch kernel list for errors → trigger reconnection ──────────── */

  useEffect(() => {
    if (
      rawKernelList.error &&
      (stateRef.current === 'connected' || stateRef.current === 'reconnecting')
    ) {
      startReconnect();
    }
  }, [rawKernelList.error, startReconnect]);

  /* ── Session restore on mount ──────────────────────────────────── */
  // Two cases are handled:
  // (a) sessionStorage has a kernel ID — verify it's still alive and set active.
  // (b) sessionStorage is empty but JEG already has running kernels (e.g. after a tab
  //     was closed and reopened) — adopt all visible kernels so polling starts and the
  //     Terminate button is enabled.

  useEffect(() => {
    const persisted = readPersistedKernel();
    const restoreController = new AbortController();

    const restoreFromGateway = async () => {
      try {
        const url = `${gatewayBaseUrl.replace(/\/$/, '')}/api/kernels`;
        const res = await fetch(url, {
          signal: restoreController.signal,
          credentials: 'include',
          headers: jwt
            ? {
                Authorization: `Bearer ${jwt}`,
                'Content-Type': 'application/json',
              }
            : { 'Content-Type': 'application/json' },
        });
        if (!res.ok) return;
        const kernels = (await res.json()) as GatewayKernel[];
        // Guard against state updates after unmount or re-run.
        if (restoreController.signal.aborted) return;

        if (persisted) {
          // Case (a): restore specific persisted kernel
          const alive = kernels.find((k) => k.id === persisted.kernelId);
          if (alive) {
            ownedKernelIds.current.add(alive.id);
            setActiveKernel(alive);
            setGatewayState('connected');
            void rawKernelList.refetch();
          } else {
            clearPersistedKernel();
            // Fall through to case (b): adopt any other running kernels
            if (kernels.length > 0) {
              kernels.forEach((k) => ownedKernelIds.current.add(k.id));
              setActiveKernel(kernels[0]);
              persistKernel(kernels[0]);
              setGatewayState('connected');
              void rawKernelList.refetch();
            }
          }
        } else if (kernels.length > 0) {
          // Case (b): no sessionStorage entry but JEG has running kernels — adopt them
          kernels.forEach((k) => ownedKernelIds.current.add(k.id));
          setActiveKernel(kernels[0]);
          persistKernel(kernels[0]);
          setGatewayState('connected');
          void rawKernelList.refetch();
        }
      } catch {
        /* session restore is best-effort */
      }
    };

    void restoreFromGateway();
    return () => restoreController.abort();
  }, []);

  /* ── Visibility-change handler ──────────────────────────────────── */

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState !== 'visible') return;
      if (stateRef.current === 'connected') {
        void rawKernelList.refetch();
      } else if (stateRef.current === 'error') {
        startReconnect();
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [rawKernelList, startReconnect]);

  /* ── Cleanup reconnect timer on unmount ────────────────────────── */

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      reconnectAbortRef.current?.abort();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, []);

  /* ── Launch + attach ────────────────────────────────────────────── */

  const launchAndAttach = useCallback(
    async (kernelName: string) => {
      setLastError(null);
      setGatewayState('launching');

      try {
        const kernel = await launchKernelWithRetry(
          gatewayBaseUrl,
          jwt,
          kernelName,
        );
        ownedKernelIds.current.add(kernel.id);
        persistKernel(kernel);
        setActiveKernel(kernel);
        // Kernel is queued on JEG. The micro-container's JupyterLab polls the
        // ghost gateway (/jeg-proxy/api/kernels) and will see it. The user then
        // switches to it via Kernel → "Use Running Kernel" in JupyterLab.
        // There is no Vectis-controlled iframe to attach to in this flow.
        setGatewayState('connected');
        void rawKernelList.refetch();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setLastError(msg);
        clearPersistedKernel();
        setGatewayState('error');
      }
    },
    [gatewayBaseUrl, jwt, rawKernelList, setGatewayState],
  );

  /* ── Terminate ──────────────────────────────────────────────────── */

  const terminate = useCallback(
    async (kernelId?: string) => {
      const id = kernelId || activeKernel?.id;
      if (!id) return;

      try {
        await terminateKernelWithRetry(gatewayBaseUrl, jwt, id);
        ownedKernelIds.current.delete(id);
        if (activeKernel?.id === id) {
          setActiveKernel(null);
          setGatewayState('idle');
        }
        clearPersistedKernel();
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        void rawKernelList.refetch();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setLastError(msg);
      }
    },
    [gatewayBaseUrl, jwt, activeKernel, rawKernelList, setGatewayState],
  );

  return {
    workspaceRef,
    specs,
    kernelList,
    connectionState,
    activeKernel,
    lastError,
    launchAndAttach,
    terminate,
    startReconnect,
  };
}
