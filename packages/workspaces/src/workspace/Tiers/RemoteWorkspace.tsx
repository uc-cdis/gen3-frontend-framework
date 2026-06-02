import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { WorkspaceAuthContext } from '../../auth/auth';
import { generateScopedNotebookPath } from './utils';
import { Button, Card, Loader, Text } from '@mantine/core';

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

/**
 * Handle a Jupyter Enterprise Gateway session.
 * @constructor
 */
const RemoteComputeWorkspace = React.forwardRef<
  RemoteComputeWorkspaceHandle,
  RemoteComputeWorkspaceProps
>(
  (
    {
      assetBaseUrl = '/api/workspace-assets/remote',
      tenantId,
      workspaceId,
      userId,
      notebookName = 'remote-workspace',
      onReady = () => {},
      onError = () => {},
    }: RemoteComputeWorkspaceProps,
    ref,
  ) => {
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
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error(error.message);
          }
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
          console.error(
            '[RemoteComputeWorkspace] Failed to attach kernel:',
            err,
          );
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

    if (loadError) {
      return (
        <div>
          <Card withBorder shadow="sm" padding="md" w="100%" maw={448}>
            <Text fw={600} c="primary">
              Remote workspace failed to load
            </Text>
            <Text size="sm" c="dimmed" mt={4}>
              Unable to connect to the Jupyter Gateway. Check the browser
              console for details.
            </Text>
            <Button variant="default" size="xs" mt="sm" onClick={handleRetry}>
              Retry
            </Button>
          </Card>
        </div>
      );
    }

    if (loading && !loadError) {
      return (
        <div
          role="status"
          aria-label="Connecting to remote workspace"
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
        >
          <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <Loader size={24} />
            <Text size="sm" c="dimmed" mt={4}>
              Connecting to Remote Gateway...
            </Text>
            <Button variant="default" size="xs" mt="sm" onClick={handleRetry}>
              Taking too long? Reload
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full flex flex-col grow">
        <iframe
          key={retryCount}
          ref={iframeRef}
          src={`${normalizedBase}/lab/index.html`}
          title="Remote Jupyter Workspace"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals allow-storage-access-by-user-activation"
          allow="clipboard-read; clipboard-write; cross-origin-isolated"
          className="min-h-0 flex-1 border-0"
          onLoad={() => {
            setLoading(false);
          }}
          onError={() => {
            setLoadError(true);
            onError?.(new Error('Unable to load remote Jupyter workspace.'));
          }}
        />
      </div>
    );
  },
);

export default RemoteComputeWorkspace;

RemoteComputeWorkspace.displayName = 'RemoteComputeWorkspace';
