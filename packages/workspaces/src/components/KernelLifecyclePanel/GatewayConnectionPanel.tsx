import React from 'react';
import { Stack, Text } from '@mantine/core';
import ConnectionStatusBadge from './ConnectionStatusBadge';
import type { GatewayConnectionState } from '../../hooks/useGatewayConnection';
import { PanelStyle, TextStyle } from './styling';

interface GatewayConnectionPanelProps {
  gatewayStatus: string;
  onRetryConnection?: () => void;
  onRunStaleReap?: () => void;
}

export const GatewayConnectionPanel = ({
  gatewayStatus,
  onRetryConnection = () => null,
  onRunStaleReap = () => null,
}: GatewayConnectionPanelProps) => {
  return (
    <Stack className={PanelStyle} justify="space-between">
      <Text className={TextStyle}>Gateway</Text>
      <div className="flex items-center gap-2">
        {gatewayStatus && (
          <ConnectionStatusBadge
            state={gatewayStatus as GatewayConnectionState}
            onRetry={onRetryConnection}
          />
        )}
        {/* TODO: Implement when api is ready
        <Button
          onClick={onRunStaleReap}
          disabled={!onRunStaleReap}
          variant="default"
        >
          Run Stale Reap
        </Button>
        ----------------------------------- */}
      </div>
    </Stack>
  );
};

export default GatewayConnectionPanel;
