import React, { useCallback, useMemo } from 'react';
import { useJegGatewayStatusQuery } from '../core/jegGatewayApi';

export type GatewayConnectionStatus =
  | 'connected'
  | 'disconnected'
  | 'fetching'
  | 'service_unavailable';

export function useGatewayConnectionStatus() {
  const [gatewayStatus, setGatewayStatus] =
    React.useState<string>('disconnected');
  const [gatewayMessage, setGatewayMessage] = React.useState<string | null>(
    null,
  );

  const setGatewayStatusAndMessage = useCallback(
    (state: string, message?: string) => {
      setGatewayStatus(state);
      setGatewayMessage(message ?? null);
    },
    [],
  );

  // get the status of the gateway
  const { data: gatewayStatusData, isFetching: isGatewayFetching } =
    useJegGatewayStatusQuery();

  const gatewayServiceStatus = useMemo(() => {
    if (isGatewayFetching) return 'fetching';
    if (!gatewayStatus) return 'service_unavailable';
    if (gatewayStatusData) return 'connected';
    return 'disconnected';
  }, [gatewayStatus, gatewayStatusData, isGatewayFetching]);

  return useMemo(
    () => ({
      gatewayServiceStatus,
      gatewayStatus,
      gatewayMessage,
      setGatewayStatusAndMessage,
    }),
    [
      gatewayServiceStatus,
      gatewayStatus,
      gatewayMessage,
      setGatewayStatusAndMessage,
    ],
  );
}
