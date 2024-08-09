import { gen3Api } from '../gen3';
import { GEN3_WORKSPACE_API } from '../../constants';
import {
  PayModel,
  PodStatus,
  WorkspaceInfo,
  WorkspaceInfoResponse,
  WorkspaceOptions,
  WorkspaceOptionsResponse,
  WorkspacePayModelResponse,
  WorkspaceStatusResponse,
} from './types';
import { selectActiveWorkspaceStatus } from './workspaceSlice';
import { CoreState } from '../../reducers';

const WorkspaceWithTags = gen3Api.enhanceEndpoints({
  addTagTypes: ['Workspace', 'PayModel'],
});

export const EmptyWorkspaceStatusResponse: WorkspaceStatusResponse = {
  status: 'Not Found',
  conditions: [],
  containerStates: [],
  idleTimeLimit: 0,
  lastActivityTime: 0,
  workspaceType: '',
};

export const workspacesApi = WorkspaceWithTags.injectEndpoints({
  endpoints: (builder) =>
    ({
      getWorkspaceOptions: builder.query<WorkspaceOptions, void>({
        query: () => `${GEN3_WORKSPACE_API}/options`,
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
      getWorkspacePayModels: builder.query<WorkspacePayModelResponse, void>({
        query: () => `${GEN3_WORKSPACE_API}/allpaymodels`,
      }),
      getActivePayModel: builder.query<PayModel, void>({
        query: () => `${GEN3_WORKSPACE_API}/paymodels`,
      }),
      getWorkspaceStatus: builder.query<WorkspaceStatusResponse, void>({
        queryFn: async (_arg0, queryApi, _extraOptions, fetchWithBQ) => {
          const currentWorkspaceStatus = selectActiveWorkspaceStatus(
            queryApi.getState() as CoreState,
          );

          const workspaceStatus = await fetchWithBQ(
            `${GEN3_WORKSPACE_API}/status`,
          );
          if (workspaceStatus.error) {
            return workspaceStatus;
          }

          if (
            workspaceStatus.data === 'Running' &&
            (currentWorkspaceStatus === 'Not Founts' ||
              currentWorkspaceStatus === 'Running')
          ) {
            const proxyStatus = await fetchWithBQ(
              `${GEN3_WORKSPACE_API}/proxy`,
            );
            if (!proxyStatus.error) {
              return {
                data: {
                  ...(workspaceStatus.data as unknown as WorkspaceStatusResponse),
                  status: 'Running',
                  conditions: [
                    {
                      type: 'ProxyConnected',
                      status: PodStatus.False,
                    },
                  ],
                } as WorkspaceStatusResponse,
              };
            }
          }
          return { data: workspaceStatus.data as WorkspaceStatusResponse };
        },
      }),
      launchWorkspace: builder.mutation<boolean, string>({
        query: (id) => {
          return {
            url: `${GEN3_WORKSPACE_API}/launch?id=${id}`,
            method: 'POST',
            invalidatesTags: ['Workspace'],
          };
        },
        transformResponse: () => true,
      }),
      terminateWorkspace: builder.mutation<void, void>({
        query: () => ({
          url: `${GEN3_WORKSPACE_API}/terminate`,
          method: 'POST',
          invalidatesTags: ['Workspace'],
        }),
      }),
      setCurrentPayModel: builder.mutation<void, string>({
        query: (id: string) => ({
          url: `${GEN3_WORKSPACE_API}/setpaymodel`,
          method: 'POST',
          body: id,
          invalidatesTags: ['PayModel'],
        }),
      }),
    } as const),
});

export const {
  useGetWorkspaceOptionsQuery,
  useGetWorkspacePayModelsQuery,
  useGetWorkspaceStatusQuery,
  useGetActivePayModelQuery,
  useSetCurrentPayModelMutation,
  useLaunchWorkspaceMutation,
  useTerminateWorkspaceMutation,
} = workspacesApi;
