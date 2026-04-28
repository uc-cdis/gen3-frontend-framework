import { useCallback, useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Types — mirrors Jupyter Gateway REST API response shapes           */
/* ------------------------------------------------------------------ */

export interface GatewayKernelSpec {
  name: string;
  spec: {
    display_name: string;
    language: string;
    argv?: string[];
    metadata?: Record<string, unknown>;
  };
  resources?: Record<string, string>;
}

export interface GatewayKernelSpecsResponse {
  default: string;
  kernelspecs: Record<string, GatewayKernelSpec>;
}

export interface GatewayKernel {
  id: string;
  name: string;
  last_activity: string;
  execution_state: string;
  connections: number;
}

export interface GatewaySession {
  id: string;
  path: string;
  name: string;
  type: string;
  kernel: {
    id: string;
    name: string;
    last_activity: string;
    execution_state: string;
    connections: number;
  };
}

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                    */
/* ------------------------------------------------------------------ */

const buildHeaders = (
  jwt: string | undefined,
  extra?: Record<string, string>,
): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  }
  return headers;
};

/* ------------------------------------------------------------------ */
/*  useKernelSpecs — GET /api/kernelspecs                              */
/* ------------------------------------------------------------------ */

export function useKernelSpecs(baseUrl: string, jwt: string | undefined) {
  const [specs, setSpecs] = useState<GatewayKernelSpec[]>([]);
  const [defaultSpec, setDefaultSpec] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const url = `${baseUrl.replace(/\/$/, '')}/api/kernelspecs`;
    fetch(url, {
      signal: controller.signal,
      credentials: 'include',
      headers: buildHeaders(jwt),
    })
      .then(async (res) => {
        if (!res.ok)
          throw new Error(`Gateway ${res.status}: ${res.statusText}`);
        return res.json() as Promise<GatewayKernelSpecsResponse>;
      })
      .then((data) => {
        setDefaultSpec(data.default || '');
        setSpecs(Object.values(data.kernelspecs || {}));
        setLoading(false);
      })
      .catch((err) => {
        if ((err as { name?: string }).name === 'AbortError') return;
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [baseUrl, jwt]);

  return { specs, defaultSpec, loading, error };
}

/* ------------------------------------------------------------------ */
/*  useKernels — GET /api/kernels (with optional polling)              */
/* ------------------------------------------------------------------ */

export function useKernels(
  baseUrl: string,
  jwt: string | undefined,
  pollIntervalMs: number = 0,
) {
  const [kernels, setKernels] = useState<GatewayKernel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // abortRef holds the controller for the current in-flight fetch.
  // A new controller is created per fetch call; the previous one is aborted on cleanup.
  const abortRef = useRef<AbortController | null>(null);

  const fetchKernels = useCallback(async () => {
    // Cancel any in-flight request before starting a new one.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const url = `${baseUrl.replace(/\/$/, '')}/api/kernels`;
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        credentials: 'include',
        headers: buildHeaders(jwt),
      });
      if (!res.ok) throw new Error(`Gateway ${res.status}: ${res.statusText}`);
      const data = (await res.json()) as GatewayKernel[];
      setKernels(data);
      setError(null);
      setLoading(false);
    } catch (err) {
      if ((err as { name?: string }).name === 'AbortError') return;
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  }, [baseUrl, jwt]);

  useEffect(() => {
    setLoading(true);
    void fetchKernels();

    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (pollIntervalMs > 0) {
      intervalId = setInterval(() => {
        void fetchKernels();
      }, pollIntervalMs);
    }

    return () => {
      abortRef.current?.abort();
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchKernels, pollIntervalMs]);

  return { kernels, loading, error, refetch: fetchKernels };
}

/* ------------------------------------------------------------------ */
/*  useSessions — GET /api/sessions                                   */
/* ------------------------------------------------------------------ */

export function useSessions(baseUrl: string, jwt: string | undefined) {
  const [sessions, setSessions] = useState<GatewaySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetchSessions takes a signal so state updates are gated on abort — fixing the
  // broken mounted-bool pattern where setSessions fired before the guard ran.
  const fetchSessions = useCallback(
    async (signal?: AbortSignal) => {
      const url = `${baseUrl.replace(/\/$/, '')}/api/sessions`;
      try {
        const res = await fetch(url, {
          signal,
          credentials: 'include',
          headers: buildHeaders(jwt),
        });
        if (!res.ok)
          throw new Error(`Gateway ${res.status}: ${res.statusText}`);
        const data = (await res.json()) as GatewaySession[];
        if (signal?.aborted) return;
        setSessions(data);
        setError(null);
        setLoading(false);
      } catch (err) {
        if ((err as { name?: string }).name === 'AbortError') return;
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      }
    },
    [baseUrl, jwt],
  );

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    void fetchSessions(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchSessions]);

  // Expose a no-arg refetch for external callers (same contract as before).
  const refetch = useCallback(() => fetchSessions(), [fetchSessions]);

  return { sessions, loading, error, refetch };
}

/* ------------------------------------------------------------------ */
/*  Imperative actions — launchKernel, terminateKernel, createSession   */
/* ------------------------------------------------------------------ */

export async function launchKernel(
  baseUrl: string,
  jwt: string | undefined,
  kernelName: string,
): Promise<GatewayKernel> {
  const url = `${baseUrl.replace(/\/$/, '')}/api/kernels`;
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: buildHeaders(jwt),
    body: JSON.stringify({ name: kernelName }),
  });
  if (!res.ok) {
    throw new Error(`Failed to launch kernel: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<GatewayKernel>;
}

/**
 * launchKernelWithRetry — wraps launchKernel with 3-attempt exponential backoff.
 * Backoff: 500ms → 1s → 2s. Throws on final failure.
 */
export async function launchKernelWithRetry(
  baseUrl: string,
  jwt: string | undefined,
  kernelName: string,
): Promise<GatewayKernel> {
  const DELAYS = [500, 1_000, 2_000];
  let lastErr: unknown;
  for (let i = 0; i <= DELAYS.length; i++) {
    try {
      return await launchKernel(baseUrl, jwt, kernelName);
    } catch (err) {
      lastErr = err;
      if (i < DELAYS.length) {
        await new Promise((r) => setTimeout(r, DELAYS[i]));
      }
    }
  }
  throw lastErr;
}

export async function terminateKernel(
  baseUrl: string,
  jwt: string | undefined,
  kernelId: string,
): Promise<void> {
  const url = `${baseUrl.replace(/\/$/, '')}/api/kernels/${encodeURIComponent(kernelId)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    credentials: 'include',
    headers: buildHeaders(jwt),
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(
      `Failed to terminate kernel: ${res.status} ${res.statusText}`,
    );
  }
}

/**
 * terminateKernelWithRetry — wraps terminateKernel with 2-attempt retry.
 * 404 is treated as success (kernel already gone — idempotent).
 */
export async function terminateKernelWithRetry(
  baseUrl: string,
  jwt: string | undefined,
  kernelId: string,
): Promise<void> {
  try {
    await terminateKernel(baseUrl, jwt, kernelId);
  } catch {
    // One retry after 1 second
    await new Promise((r) => setTimeout(r, 1_000));
    await terminateKernel(baseUrl, jwt, kernelId);
  }
}

export async function createSession(
  baseUrl: string,
  jwt: string | undefined,
  opts: {
    path: string;
    name?: string;
    type?: string;
    kernelName?: string;
    kernelId?: string;
  },
): Promise<GatewaySession> {
  const url = `${baseUrl.replace(/\/$/, '')}/api/sessions`;
  const body: Record<string, unknown> = {
    path: opts.path,
    name: opts.name || opts.path,
    type: opts.type || 'notebook',
  };
  if (opts.kernelId) {
    body.kernel = { id: opts.kernelId };
  } else if (opts.kernelName) {
    body.kernel = { name: opts.kernelName };
  }
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: buildHeaders(jwt),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(
      `Failed to create session: ${res.status} ${res.statusText}`,
    );
  }
  return res.json() as Promise<GatewaySession>;
}
