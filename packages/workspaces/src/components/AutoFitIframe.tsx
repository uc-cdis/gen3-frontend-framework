// components/AutoFitIframe.tsx

import React, { useState } from 'react';
import { Button, Card, LoadingOverlay, Text } from '@mantine/core';
import { type NudgeFn, useIframeAutoFit } from '../hooks/useIframeAutoFit';

export interface AutoFitIframeProps {
  src: string;
  title: string;
  /** Called with the iframe's contentWindow whenever the wrapper resizes. Omit if the embedded app needs no nudging. */
  onNudge?: NudgeFn;
  sandbox?: string;
  allow?: string;
  className?: string;
  /**
   * Custom error UI. Receives a `retry` callback to wire up to whatever
   * action your component needs. If omitted, a default Card/Text/Button
   * error panel is shown using errorTitle/errorMessage.
   */
  renderError?: (retry: () => void) => React.ReactNode;
  errorTitle?: string;
  errorMessage?: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
  debounceMs?: number;
}

export function AutoFitIframe({
  src,
  title,
  onNudge,
  sandbox,
  allow,
  className,
  renderError,
  errorTitle = 'Failed to render',
  errorMessage = 'Unable to load embedded content. Check the browser console for details.',
  onReady,
  onError,
  debounceMs,
}: AutoFitIframeProps) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const { wrapperRef, iframeRef, nudgeNow } = useIframeAutoFit({
    onNudge: onNudge ?? (() => {}),
    debounceMs,
  });

  const handleRetry = () => {
    setLoadError(false);
    setLoading(true);
    setRetryCount((n) => n + 1);
  };

  if (loadError) {
    if (renderError) {
      return <>{renderError(handleRetry)}</>;
    }
    return (
      <div>
        <Card withBorder shadow="sm" padding="md" w="100%" maw={448}>
          <Text fw={600} c="primary">
            {errorTitle}
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            {errorMessage}
          </Text>
          <Button variant="default" size="xs" mt="sm" onClick={handleRetry}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className={className ?? 'w-full flex flex-col grow'}>
      <LoadingOverlay visible={loading} />
      <iframe
        key={retryCount}
        ref={iframeRef}
        src={src}
        title={title}
        sandbox={sandbox}
        allow={allow}
        style={{ border: 'none' }}
        className="min-h-0 flex-1 border-0"
        onLoad={() => {
          setLoading(false);
          nudgeNow();
          onReady?.();
        }}
        onError={() => {
          setLoadError(true);
          onError?.(new Error(`Unable to load: ${title}`));
        }}
      />
    </div>
  );
}
