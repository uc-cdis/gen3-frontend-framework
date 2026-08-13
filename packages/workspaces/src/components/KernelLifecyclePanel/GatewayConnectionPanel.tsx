import React from 'react';
import { Stack, Text } from '@mantine/core';
import ConnectionStatusBadge from './ConnectionStatusBadge';
import type { GatewayConnectionState } from '../../hooks/useGatewayConnection';
import { PanelStyle, TextStyle } from './styling';
import { useReapKernelsMutation } from '../../core/jegGatewayApi';

interface GatewayConnectionPanelProps {
  gatewayStatus: string;
  onRetryConnection?: () => void;
  onRunStaleReap?: () => void;
}

export const GatewayConnectionPanel = ({
  gatewayStatus,
  onRetryConnection = () => null,
  // oxlint-disable-next-line no-unused-vars
  onRunStaleReap = () => null,
}: GatewayConnectionPanelProps) => {
  // TODO Add support for stale kernel reap
  // oxlint-disable-next-line no-unused-vars
  const [reapKernels, { isLoading, isError }] = useReapKernelsMutation();
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
        {/* TODO: Implement or place somewhere else
        <Button
          onClick={() => reapKernels()}
          disabled={!onRunStaleReap}
          variant="default"
          loading={isLoading}
        >
          Reap Stale Kernels
        </Button>
        */}
      </div>
    </Stack>
  );
};

export default GatewayConnectionPanel;
