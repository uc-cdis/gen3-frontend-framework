import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { WorkspaceAuthContext } from '../auth/auth';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type RemoteComputeWorkspaceConfig = Record<string, unknown>;

export type RemoteComputeWorkspaceHandle = {
  /** Attach a running kernel to the notebook open in the iframe. */
  attachKernel: (kernelId: string, kernelName: string) => Promise<boolean>;
  /** True once the JupyterLite app inside the iframe reports ready. */
  isReady: boolean;
};

export type RemoteComputeWorkspaceProps = {
  assetBaseUrl?: string;
  className?: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
  authContext?: WorkspaceAuthContext;
  runtimeModeKey?: string;
  // Multi-tenant scope for session isolation and audit trails
  tenantId: string;
  workspaceId: string;
  userId: string;
  notebookName?: string;
};

/* ------------------------------------------------------------------ */
/*  Scoped notebook path — deterministic, multi-tenant isolated path   */
/* ------------------------------------------------------------------ */

// NFC normalization runs first so visually identical Unicode sequences (e.g.
// decomposed combining characters) are collapsed before the ASCII whitelist strips them.
const sanitizeSegment = (s: string) =>
  s.normalize('NFC').replace(/[^a-zA-Z0-9._-]/g, '_');

const generateScopedNotebookPath = (opts: {
  tenantId: string;
  workspaceId: string;
  userId: string;
  notebookName?: string;
}): string => {
  const { tenantId, workspaceId, userId, notebookName = 'untitled' } = opts;
  if (!tenantId || !workspaceId || !userId) {
    throw new Error(
      'tenantId, workspaceId, and userId are required for session scoping',
    );
  }
  return `/${sanitizeSegment(tenantId)}/${sanitizeSegment(workspaceId)}/${sanitizeSegment(userId)}/${sanitizeSegment(notebookName)}.ipynb`;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const RemoteComputeWorkspace = React.forwardRef<
  RemoteComputeWorkspaceHandle,
  RemoteComputeWorkspaceProps
>(function RemoteComputeWorkspace(
  {
    assetBaseUrl = '/api/workspace-assets/remote',
    className,
    onReady,
    onError,
    tenantId,
    workspaceId,
    userId,
    notebookName = 'remote-workspace',
  },
  ref,
) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [jupyterReady, setJupyterReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const normalizedBase = assetBaseUrl.replace(/\/$/, '');

  // Scoped notebook path for session isolation
  let scopedNotebookPath: string;
  try {
    scopedNotebookPath = generateScopedNotebookPath({
      tenantId,
      workspaceId,
      userId,
      notebookName,
    });
  } catch {
    const userHash = btoa(userId || 'anonymous').substring(0, 8);
    scopedNotebookPath = `/workspace/${userHash}/${notebookName}.ipynb`;
  }

  /* ---- Layout nudge (same pattern as FreeTierWorkspace) ---------- */

  const nudgeIframeLayout = useCallback(() => {
    const frameWindow = iframeRef.current?.contentWindow;
    if (!frameWindow) return;
    try {
      frameWindow.dispatchEvent(new Event('resize'));
      const app = (frameWindow as any).jupyterapp;
      app?.shell?.fit?.();
      app?.shell?.update?.();
    } catch {
      // cross-origin guard
    }
  }, []);

  useEffect(() => {
    const onLayoutChanged = () => {
      nudgeIframeLayout();
      const ids = [100, 200, 350].map((ms) =>
        window.setTimeout(nudgeIframeLayout, ms),
      );
      return () => ids.forEach((id) => window.clearTimeout(id));
    };

    window.addEventListener(
      'gen3-workspace-layout-changed',
      onLayoutChanged as EventListener,
    );
    return () => {
      window.removeEventListener(
        'gen3-workspace-layout-changed',
        onLayoutChanged as EventListener,
      );
    };
  }, [nudgeIframeLayout]);

  /* ---- Wait for JupyterLite app inside the iframe --------------- */

  useEffect(() => {
    if (!iframeRef.current || loadError) return;
    if (jupyterReady) return;

    let mounted = true;
    let attempts = 0;
    const maxAttempts = 60; // ~30s at 500ms intervals

    const poll = () => {
      if (!mounted) return;
      attempts += 1;
      try {
        const app = (iframeRef.current?.contentWindow as any)?.jupyterapp;
        if (app?.status === 'ready' || app?.started) {
          setJupyterReady(true);
          onReady?.();
          return;
        }
      } catch {
        // cross-origin or not loaded yet
      }
      if (attempts < maxAttempts) {
        window.setTimeout(poll, 500);
      }
    };

    // Start polling after iframe fires onLoad
    if (!loading) {
      poll();
    }

    return () => {
      mounted = false;
    };
  }, [loading, loadError, jupyterReady, onReady]);

  /* ---- Kernel attachment via same-origin iframe access ----------- */

  const attachKernel = useCallback(
    async (kernelId: string, kernelName: string): Promise<boolean> => {
      try {
        const app = (iframeRef.current?.contentWindow as any)?.jupyterapp;
        if (!app?.serviceManager?.sessions) {
          console.warn(
            '[RemoteComputeWorkspace] JupyterApp not ready for kernel attachment',
          );
          return false;
        }

        await app.serviceManager.sessions.startNew({
          name: notebookName,
          path: scopedNotebookPath,
          type: 'notebook',
          kernel: { id: kernelId, name: kernelName },
        });

        return true;
      } catch (err) {
        console.error('[RemoteComputeWorkspace] Failed to attach kernel:', err);
        return false;
      }
    },
    [scopedNotebookPath, notebookName],
  );

  /* ---- Expose handle to parent ---------------------------------- */

  useImperativeHandle(
    ref,
    () => ({
      attachKernel,
      isReady: jupyterReady,
    }),
    [attachKernel, jupyterReady],
  );

  /* ---- Retry handler -------------------------------------------- */

  const handleRetry = () => {
    setLoadError(false);
    setLoading(true);
    setJupyterReady(false);
    setRetryCount((n) => n + 1);
  };

  /* ---- Render --------------------------------------------------- */

  return (
    <section
      className={[
        'relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white',
        'dark:bg-slate-900',
        className || '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {loading && !loadError && (
        <div
          role="status"
          aria-label="Connecting to remote workspace"
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm dark:bg-slate-900/70"
        >
          <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div
              className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-accent-dark"
              aria-hidden="true"
            />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Connecting to Remote Gateway...
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-1 text-xs text-slate-500 underline hover:text-accent-dark"
            >
              Taking too long? Reload
            </button>
          </div>
        </div>
      )}

      {loadError && (
        <div
          role="alert"
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-slate-900/80"
        >
          <div className="pointer-events-auto w-full max-w-md rounded-lg border border-primary-light bg-white p-4 text-sm shadow-sm dark:border-primary-dark dark:bg-slate-900">
            <p className="font-semibold text-primary dark:text-primary-light">
              Remote workspace failed to load
            </p>
            <p className="mt-1 text-slate-700 dark:text-slate-200">
              Unable to connect to the Jupyter Gateway. Check the browser
              console for details.
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-3 rounded border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <iframe
        key={retryCount}
        ref={iframeRef}
        src={`${normalizedBase}/lab/index.html`}
        title="Remote Jupyter Workspace"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals allow-storage-access-by-user-activation"
        allow="clipboard-read; clipboard-write; cross-origin-isolated"
        className="min-h-0 flex-1 border-0"
        style={{ width: '100%' }}
        onLoad={() => {
          setLoading(false);
          nudgeIframeLayout();
        }}
        onError={() => {
          setLoadError(true);
          onError?.(new Error('Unable to load remote Jupyter workspace.'));
        }}
      />
    </section>
  );
});

export default RemoteComputeWorkspace;
