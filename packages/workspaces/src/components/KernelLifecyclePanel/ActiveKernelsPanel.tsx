import React, { useEffect } from 'react';
import { useKernalSpecsQuery } from '../../core/kernelApi';
import { LoadingOverlay, Stack, Text } from '@mantine/core';
import ActiveKernelInfoPanel from './ActiveKernelInfoPanel';
import { useActiveKernelsQuery } from '../../core/jegGatewayApi';
import {
  CoreState,
  normalizeRtkError,
  removeManyJEGActiveKernels,
  selectJEGKernelIds,
  upsertManyJEGActiveKernels,
  useCoreDispatch,
  useCoreSelector,
} from '@gen3/core';

export const ActiveKernelsPanel = () => {
  const {
    data: kernels,
    isLoading,
    isError,
    error,
  } = useActiveKernelsQuery(undefined, {
    pollingInterval: 10000,
    selectFromResult: ({ data, isLoading, isError, error }) => ({
      data,
      isLoading,
      isError,
      error,
    }),
  });

  const persistedActiveKernels = useCoreSelector((state: CoreState) =>
    selectJEGKernelIds(state),
  );
  const coreDispatch = useCoreDispatch();

  useEffect(() => {
    if (!kernels) return;

    const liveIds = new Set(kernels.map((k) => k.id));

    const staleIds = (persistedActiveKernels as string[]).filter(
      (id) => !liveIds.has(id),
    );
    if (staleIds.length > 0) {
      coreDispatch(removeManyJEGActiveKernels(staleIds));
    }

    coreDispatch(
      upsertManyJEGActiveKernels(
        kernels.map((k) => ({
          id: k.id,
          name: k.name,
          connections: k.connections,
          executionState: k.execution_state.toLowerCase(),
          lastActivity: k.last_activity,
        })),
      ),
    );
  }, [kernels]);

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
      <LoadingOverlay visible={isLoading} />
      <Text>Active Kernels</Text>
      {kernels && kernels?.length > 0 ? (
        kernels.map((kernel) => {
          // convert last_activity from iso timestamp to minutes
          const kernelUptime =
            new Date().getTime() - new Date(kernel.last_activity).getTime();

          return (
            <ActiveKernelInfoPanel
              kernelId={kernel.id}
              kernelName={kernel.name}
              executionState={kernel.execution_state.toLowerCase()}
              uptimeMinutes={Math.floor(kernelUptime / 60000)}
              rowSpec={kernelSpecs?.find((spec) => spec.name === kernel.name)}
              key={kernel.id}
            />
          );
        })
      ) : (
        <div className="mt-4 flex justify-center items-center text-sm bg-accent-lighter text-accent-contrast-lighter p-2">
          <Text size="sm">No active kernels.</Text>
        </div>
      )}
    </Stack>
  );
};

export default ActiveKernelsPanel;
