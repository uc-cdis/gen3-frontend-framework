import {
  gen3Api,
  WorkspaceInfo,
  WorkspaceInfoResponse,
  WorkspaceOptions,
  WorkspaceOptionsResponse,
} from '@gen3/core';
import { GEN3_HATCHERY_API } from '../constants';
import { HatcheryServiceState, HatcheryServiceStatus } from './types';

const HatcheryWithTags = gen3Api.enhanceEndpoints({
  addTagTypes: ['Hatchery'],
});

const StatusStringToHatcheryServiceStatus: Record<string, Array<string>> = {
  running: ['launching', 'pending', 'starting'],
  stopped: ['not-running', 'stopped', 'terminated'],
  terminated: ['terminating', 'stopping'],
};

interface HatcheryItem {
  name?: string;
  hash?: string;
  id?: string;
}

interface HatcheryStatusResponse {
  status: string;
  conditions: unknown;
  containerStates: unknown;
  idleTimeLimit: number;
  lastActivityTime: number;
  workspaceType: string;
}

export const hatcheryApi = HatcheryWithTags.injectEndpoints({
  endpoints: (builder) => ({
    doesHatcheryOptionExists: builder.query<string | null, string>({
      query: () => `${GEN3_HATCHERY_API}/options`,
      transformResponse: (response: Array<HatcheryItem>, _meta, tag) => {
        const match = response.find((o) => o.name?.includes(tag));
        return match?.hash ?? match?.id ?? null;
      },
    }),
    hatcheryOptions: builder.query<WorkspaceOptions | null, void>({
      query: () => `${GEN3_HATCHERY_API}/options`,
      transformResponse: (response: WorkspaceOptionsResponse) => {
        return response.map((workspace: WorkspaceInfoResponse) => {
          return {
            id: workspace.id,
            name: workspace.name,
            idleTimeLimit: workspace['idle-time-limit'],
            memoryLimit: workspace['memory-limit'],
            cpuLimit: workspace['cpu-limit'],
          } as WorkspaceInfo;
        });
      },
    }),
    hatcheryStatus: builder.query<HatcheryServiceStatus, string | null>({
      query: (containerHash) => {
        const hash = containerHash;
        const query = hash ? `?id=${encodeURIComponent(hash)}` : '';
        return `${GEN3_HATCHERY_API}/status/${query}`;
      },
      transformErrorResponse: (error) => {
        console.error('Hatchery status query error:', error);
        return {
          status: HatcheryServiceState.error,
          idleTimeLimit: 0,
          lastActivity: 0,
          workspaceType: '',
        };
      },
      transformResponse: (response: HatcheryStatusResponse) => {
        const results = (response.status || 'unknown').toLowerCase();
        let hatcheryStatus = HatcheryServiceState.unknown;

        console.log(
          'StatusStringToHatcheryServiceStatus',
          StatusStringToHatcheryServiceStatus,
          results,
        );

        if (results === 'not found' || results === 'unknown')
          hatcheryStatus = HatcheryServiceState.unknown;

        if (StatusStringToHatcheryServiceStatus.running.includes(results)) {
          hatcheryStatus = HatcheryServiceState.running;
        }

        if (StatusStringToHatcheryServiceStatus.stopped.includes(results)) {
          hatcheryStatus = HatcheryServiceState.stopped;
        }

        if (StatusStringToHatcheryServiceStatus.terminated.includes(results)) {
          hatcheryStatus = HatcheryServiceState.terminating;
        }

        // return other status
        return {
          status: hatcheryStatus,
          idleTimeLimit: response.idleTimeLimit,
          lastActivityTime: response.lastActivityTime,
          workspaceType: response.workspaceType,
        };
      },
    }),
    launchHatcheryWorkspace: builder.mutation<boolean, string>({
      query: (id) => {
        return {
          url: `${GEN3_HATCHERY_API}/launch?id=${id}`,
          method: 'POST',
          invalidatesTags: ['Hatchery'],
          responseHandler: (response) => response.text(),
        };
      },
      transformResponse: async (response: string) => {
        return !!(response && response === 'Success');
      },
    }),
    terminateHatcheryWorkspace: builder.mutation<string, string>({
      query: (id) => ({
        url: `${GEN3_HATCHERY_API}/terminate/?id=${id}`,
        method: 'POST',
        invalidatesTags: ['Hatchery'],
        responseHandler: (response) => response.text(),
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useDoesHatcheryOptionExistsQuery,
  useHatcheryOptionsQuery,
  useLazyHatcheryOptionsQuery,
  useHatcheryStatusQuery,
  useLazyHatcheryStatusQuery,
  useLaunchHatcheryWorkspaceMutation,
  useTerminateHatcheryWorkspaceMutation,
} = hatcheryApi;
