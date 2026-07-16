import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, LoadingOverlay, Text } from '@mantine/core';
import { ACTIVITY_CHANNEL } from '@gen3/frontend';

export interface FreeWorkspaceProps {
  assetBaseUrl?: string;
  className?: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

const FreeWorkspace = ({
  assetBaseUrl = '/api/workspace-assets/free',
  onReady,
  onError,
}: FreeWorkspaceProps) => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [jupyterReady, setJupyterReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  const url = `${assetBaseUrl}/lab/index.html`;

  const handleRetry = useCallback(() => {
    setLoadError(false);
    setLoading(true);
    setRetryCount((n) => n + 1);
  }, []);

  // set up BroadcastChannel
  useEffect(() => {
    if (!broadcastChannelRef?.current) {
      broadcastChannelRef.current = new BroadcastChannel(ACTIVITY_CHANNEL);
    }

    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
        broadcastChannelRef.current = null;
      }
    };
  }, []);

  // Handle setting up iframe event listeners for activity detection.
  // Tries same-origin contentDocument access first; falls back to
  // focus/blur heuristics when the iframe is cross-origin.
  useEffect(() => {
    if (!jupyterReady) return;

    const updateUserActivity = () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: 'activity-update',
          timestamp: Date.now(),
        });
      }
    };

    const iframe = iframeRef.current;
    let usedDirectListeners = false;

    if (iframe?.contentWindow) {
      try {
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow.document;

        if (iframeDoc) {
          iframeDoc.addEventListener('mousedown', updateUserActivity);
          iframeDoc.addEventListener('keypress', updateUserActivity);
          iframeDoc.addEventListener('scroll', updateUserActivity);
          iframeDoc.addEventListener('touchstart', updateUserActivity);
          usedDirectListeners = true;
        }
      } catch {
        // cross-origin — fall through to focus/blur fallback
      }
    }

    // Fallback: treat iframe receiving focus as user activity.
    // This fires when the user clicks into the iframe even if we
    // cannot attach listeners to its document directly.
    if (!usedDirectListeners) {
      window.addEventListener('blur', updateUserActivity);
      window.addEventListener('focus', updateUserActivity);
    }

    return () => {
      if (usedDirectListeners && iframe?.contentWindow) {
        try {
          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow.document;
          if (iframeDoc) {
            iframeDoc.removeEventListener('mousedown', updateUserActivity);
            iframeDoc.removeEventListener('keypress', updateUserActivity);
            iframeDoc.removeEventListener('scroll', updateUserActivity);
            iframeDoc.removeEventListener('touchstart', updateUserActivity);
          }
        } catch {
          // Ignore cleanup errors
        }
      }
      if (!usedDirectListeners) {
        window.removeEventListener('blur', updateUserActivity);
        window.removeEventListener('focus', updateUserActivity);
      }
    };
  }, [jupyterReady]);

  if (loadError) {
    return (
      <div>
        <Card withBorder shadow="sm" padding="md" w="100%" maw={448}>
          <Text fw={600} c="primary">
            Jupyter failed to render
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            Unable to load JupyterLite. Check the browser console for details.
          </Text>
          <Button variant="default" size="xs" mt="sm" onClick={handleRetry}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col grow">
      <LoadingOverlay visible={loading} />
      <iframe
        src={url}
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        key={retryCount}
        ref={iframeRef}
        title="JupyterLite Workspace"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals allow-storage-access-by-user-activation"
        allow="clipboard-read; clipboard-write; cross-origin-isolated"
        className="min-h-0 flex-1 border-0"
        onLoad={() => {
          setLoading(false);
          setJupyterReady(true);
          onReady?.();
        }}
        onError={() => {
          setLoadError(true);
          onError?.(new Error('Unable to load JupyterLite workspace.'));
        }}
      ></iframe>
    </div>
  );
};

export default FreeWorkspace;
