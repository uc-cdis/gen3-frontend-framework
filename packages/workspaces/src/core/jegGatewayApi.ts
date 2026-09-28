import { gen3Api } from '@gen3/core';
import { GEN3_JEG_GATEWAY_API } from '../constants';
import { GatewayKernel } from '../core/types';

/**
 * manages lifecycle of kernels from JEG Gateway API
 */

const GatewayWithTags = gen3Api.enhanceEndpoints({
  addTagTypes: ['Gateway', 'ActiveKernels'],
});

export const jegGatewayApi = GatewayWithTags.injectEndpoints({
  endpoints: (builder) => ({
    activeKernels: builder.query<Array<GatewayKernel>, void>({
      query: () => ({
        url: `${GEN3_JEG_GATEWAY_API}/kernels`,
        // Auth proxies may redirect 401/403 to a login page (302→200 HTML).
        // Per-request validateStatus catches that by rejecting redirected responses.
        validateStatus: (response) =>
          !response.redirected &&
          response.status >= 200 &&
          response.status < 300,
      }),
      transformResponse: (response: Array<GatewayKernel>) => {
        return response;
      },
      providesTags: ['ActiveKernels'],
    }),
    jegGatewayStatus: builder.query<boolean, void>({
      query: () => `${GEN3_JEG_GATEWAY_API}/status`,
      transformResponse: (response: Record<string, unknown>, _meta) => {
        const data = response as { enabled?: boolean };
        return data?.enabled ?? false;
      },
    }),
    launchKernel: builder.mutation<GatewayKernel, string>({
      query: (kernelName: string) => {
        return {
          url: `${GEN3_JEG_GATEWAY_API}/kernels`,
          method: 'POST',
          body: JSON.stringify({ name: kernelName }),
        };
      },
      invalidatesTags: ['ActiveKernels'],
    }),
    terminateKernel: builder.mutation<void, string>({
      query: (kernelId) => ({
        url: `${GEN3_JEG_GATEWAY_API}/kernels/${encodeURIComponent(kernelId)}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ActiveKernels'],
    }),
    reapKernels: builder.mutation<any, void>({
      query: () => {
        return {
          url: `/api/workspace/kernel/reap`,
          method: 'POST',
        };
      },
      invalidatesTags: ['ActiveKernels'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useActiveKernelsQuery,
  useLaunchKernelMutation,
  useTerminateKernelMutation,
  useJegGatewayStatusQuery,
  useReapKernelsMutation,
} = jegGatewayApi;

// select active kernels
export const selectActiveKernels =
  jegGatewayApi.endpoints.activeKernels.select();
