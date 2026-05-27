import React, { useCallback, useRef, useState } from 'react';
import { Button, Card, Text } from '@mantine/core';

export interface FreeWorkspaceProps {
  assetBaseUrl?: string;
  className?: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

const FreeWorkspace = ({
  assetBaseUrl = '/site',
  onReady,
  onError,
}: FreeWorkspaceProps) => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const url = `${assetBaseUrl}/lab/index.html`;

  const handleRetry = useCallback(() => {
    setLoadError(false);
    setLoading(true);
    setRetryCount((n) => n + 1);
  }, []);

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
