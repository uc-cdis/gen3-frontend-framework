import { gen3Api } from '@gen3/core';
import { GEN3_JEG_GATEWAY_API } from '../constants';
import { GatewayKernel } from '../core/types';

/**
 * manages lifecycle of kernels from JEG Gateway API
 */

const GatewayWithTags = gen3Api.enhanceEndpoints({
  addTagTypes: ['Gateway'],
});

export const jegGatewayApi = GatewayWithTags.injectEndpoints({
  endpoints: (builder) => ({
    activeKernels: builder.query<Array<GatewayKernel>, void>({
      query: () => `${GEN3_JEG_GATEWAY_API}/kernels`,
      transformResponse: (response: Array<GatewayKernel>, _meta, tag) => {
        return response;
      },
    }),
    launchKernel: builder.mutation<void, string>({
      query: (kernelName: string) => ({
        url: `${GEN3_JEG_GATEWAY_API}/kernels`,
        method: 'POST',
        body: JSON.stringify({ name: kernelName }),
      }),
    }),
    terminateKernel: builder.mutation<void, string>({
      query: (kernelId) => ({
        url: `${GEN3_JEG_GATEWAY_API}/kernels/${encodeURIComponent(kernelId)}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useActiveKernelsQuery,
  useLaunchKernelMutation,
  useTerminateKernelMutation,
} = jegGatewayApi;
