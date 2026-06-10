import React from 'react';
import { useKernalSpecsQuery } from '../../core/kernelApi';
import { LoadingOverlay, Stack, Text } from '@mantine/core';
import ActiveKernelInfoPanel from './ActiveKernelInfoPanel';
import { useActiveKernelsQuery } from '../../core/jegGatewayApi';
import { normalizeRtkError } from '@gen3/core';

export const ActiveKernelsPanel = () => {
  // get the active kernels

  const {
    data: kernels,
    isFetching,
    isError,
    error,
    isSuccess,
  } = useActiveKernelsQuery(undefined, { pollingInterval: 10000 });

  console.log('kernels', isError, error);

  const {
    data: kernelSpecs,
    isFetching: isFetchingKernelSpecs,
    isError: isErrorKernelSpecs,
    error: errorKernelSpecs,
    isSuccess: isSuccessKernelSpecs,
  } = useKernalSpecsQuery();

  if (isError) {
    const normalizedError = normalizeRtkError(error);
    const status = normalizedError?.status;
    const isAuthError = status === 401 || status === 403;
    return (
      <div className="mt-4 flex justify-center items-center text-sm bg-accent-lighter text-accent-contrast-lighter p-2">
        <Text size="sm">
          {isAuthError
            ? 'You must be logged in to view active kernels.'
            : 'Failed to load active kernels.'}
        </Text>
      </div>
    );
  }

  return (
    <Stack gap={2} classNames={{ root: 'w-full h-full' }}>
      <LoadingOverlay visible={isFetching} />
      <Text>Active Kernels</Text>
      {kernels && kernels?.length > 0 ? (
        kernels.map((kernel) => (
          <ActiveKernelInfoPanel
            kernelId={kernel.id}
            kernelName={kernel.name}
            rowSpec={kernelSpecs?.find((spec) => spec.name === kernel.name)}
            key={kernel.id}
          />
        ))
      ) : (
        <div className="mt-4 flex justify-center items-center text-sm bg-accent-lighter text-accent-contrast-lighter p-2">
          <Text size="sm">No active kernels.</Text>
        </div>
      )}
    </Stack>
  );
};

export default ActiveKernelsPanel;
