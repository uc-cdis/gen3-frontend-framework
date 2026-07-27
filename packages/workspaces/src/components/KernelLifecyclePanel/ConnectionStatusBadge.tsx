import React from 'react';
import { Badge, Loader } from '@mantine/core';
import type { GatewayConnectionState } from '../../hooks/useGatewayConnection';

export interface ConnectionStatusBadgeProps {
  state: GatewayConnectionState;
  /** Called when user clicks the "Retry" link in error state. */
  onRetry?: () => void;
}

/**
 * Small inline indicator rendered inside KernelLifecyclePanel header.
 * In 'reconnecting' state the lifecycle panel and iframe remain visible —
 * this badge is the ONLY signal to the user, preserving their workflow.
 */
const ConnectionStatusBadge = ({ state }: ConnectionStatusBadgeProps) => {
  if (state === 'idle') return null;

  if (state === 'connected') {
    return (
      <Badge
        variant="light"
        leftSection={
          <span
            className="h-1.5 w-1.5 rounded-full bg-accent-dark"
            aria-hidden="true"
          />
        }
        color="accent"
        className="normal-case"
        role="status"
      >
        Connected
      </Badge>
    );
  }

  if (state === 'launching') {
    return (
      <Badge
        variant="light"
        leftSection={<Loader size="0.75rem" />}
        className="normal-case"
        role="status"
        aria-live="polite"
      >
        Starting kernel…
      </Badge>
    );
  }

  if (state === 'attaching') {
    return (
      <Badge
        variant="light"
        leftSection={<Loader size="0.75rem" />}
        className="normal-case"
        role="status"
        aria-live="polite"
      >
        Connecting…
      </Badge>
    );
  }

  if (state === 'reconnecting') {
    return (
      <Badge
        variant="light"
        leftSection={<Loader size="0.75rem" />}
        className="normal-case"
        role="status"
        aria-live="polite"
      >
        Reconnecting…
      </Badge>
    );
  }

  if (state === 'error') {
    return (
      <Badge
        variant="light"
        leftSection={<span aria-hidden="true">✕</span>}
        className="normal-case"
        role="alert"
      >
        Error
      </Badge>
    );
  }

  return null;
};

export default ConnectionStatusBadge;
