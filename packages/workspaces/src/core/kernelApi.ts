import { gen3Api } from '@gen3/core';
import { GEN3_KERNEL_API } from '../constants';
import { KernelSpecEntry, KernelSpecsResponse } from './types';

const KernelWithTags = gen3Api.enhanceEndpoints({
  addTagTypes: ['Kernel'],
});

interface KernelItemResponse {
  name: string;
  hash?: string;
  id: string;
  execution_state: string;
  last_activity: string;
  connections: number;
}

export interface KernelItem extends Omit<
  KernelItemResponse,
  'execution_state' | 'last_activity'
> {
  executionState: string;
  lastActivity: string;
}

export const kernelApi = KernelWithTags.injectEndpoints({
  endpoints: (builder) => ({
    kernels: builder.query<Array<KernelItem>, void>({
      query: () => `${GEN3_KERNEL_API}/kernels`,
      transformResponse: (response: Array<KernelItemResponse>) => {
        return response.map((kernel) => ({
          ...kernel,
          executionState: kernel.execution_state,
          lastActivity: kernel.last_activity,
        }));
      },
    }),
    kernalSpecs: builder.query<Array<KernelSpecEntry>, void>({
      query: () => {
        return `${GEN3_KERNEL_API}/kernelspecs`;
      },
      transformResponse: (response: KernelSpecsResponse) => {
        const res = Object.values(response.kernelspecs).reduce((acc, value) => {
          acc.push({
            name: value.name,
            displayName: value.spec.display_name,
            language: value.spec.language,
            nodeType: value.spec.metadata?.nodeType,
            // TODO: cpu and gpu
            // cpu: value.spec.metadata?.cpu,
            // gpu: value.spec.metadata?.gpu,
          });
          return acc;
        }, [] as Array<KernelSpecEntry>);
        return res;
      },
    }),
  }),
});

export const { useKernelsQuery } = kernelApi;
