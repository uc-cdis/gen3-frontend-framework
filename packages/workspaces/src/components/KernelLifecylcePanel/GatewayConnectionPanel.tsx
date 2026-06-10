import React from 'react';
import { useJegGatewayStatusQuery } from '../../core/jegGatewayApi';
import { Stack, Text } from '@mantine/core';

export const GatewayConnectionPanel = () => {
  const { data, isFetching, isError, error, isSuccess, isLoading } =
    useJegGatewayStatusQuery();

  return (
    <Stack>
      <Text>Gateway Connection Panel</Text>
    </Stack>
  );
};

export default GatewayConnectionPanel;
