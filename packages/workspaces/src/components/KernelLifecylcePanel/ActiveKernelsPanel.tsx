import React from 'react';
import { useKernalSpecsQuery } from '../../core/kernelApi';
import { LoadingOverlay, Stack, Text } from '@mantine/core';
import ActiveKernelInfoPanel from './ActiveKernelInfoPanel';
import { useActiveKernelsQuery } from '../../core/jegGatewayApi';

export const ActiveKernelsPanel = () => {
  // get the active kernels

  const {
    data: kernels,
    isFetching,
    isError,
    error,
    isSuccess,
  } = useActiveKernelsQuery(undefined, { pollingInterval: 5000 });

  const {
    data: kernelSpecs,
    isFetching: isFetchingKernelSpecs,
    isError: isErrorKernelSpecs,
    error: errorKernelSpecs,
    isSuccess: isSuccessKernelSpecs,
  } = useKernalSpecsQuery();

  return (
    <Stack gap={2}>
      <LoadingOverlay visible={isFetching} />
      <Text>Active Kernels</Text>
      {kernels?.map((kernel) => (
        <ActiveKernelInfoPanel
          kernelId={kernel.id}
          kernelName={kernel.name}
          rowSpec={kernelSpecs?.find((spec) => spec.name === kernel.name)}
          key={kernel.id}
        />
      ))}
    </Stack>
  );
};

export default ActiveKernelsPanel;
