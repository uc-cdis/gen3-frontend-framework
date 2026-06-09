import {
  type KernelItem,
  useKernalSpecsQuery,
  useKernelsQuery,
} from './kernelApi';
import type { KernelSpecEntry } from './types';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export interface KernelsAndSpecsQueryResult {
  kernels: Array<KernelItem>;
  kernelSpecs: Array<KernelSpecEntry>;
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: FetchBaseQueryError | SerializedError | undefined;
}

export const useKernelsAndSpecsQuery = (
  polling: number = 5000,
): KernelsAndSpecsQueryResult => {
  const kernelsResult = useKernelsQuery(undefined, {
    pollingInterval: polling,
  });
  const kernalSpecsResult = useKernalSpecsQuery(undefined, {
    pollingInterval: polling,
  });

  return {
    kernels: kernelsResult.data ?? [],
    kernelSpecs: kernalSpecsResult.data ?? [],
    isLoading: kernelsResult.isLoading || kernalSpecsResult.isLoading,
    isFetching: kernelsResult.isFetching || kernalSpecsResult.isFetching,
    isSuccess: kernelsResult.isSuccess && kernalSpecsResult.isSuccess,
    isError: kernelsResult.isError || kernalSpecsResult.isError,
    error: kernelsResult.error ?? kernalSpecsResult.error,
  };
};
