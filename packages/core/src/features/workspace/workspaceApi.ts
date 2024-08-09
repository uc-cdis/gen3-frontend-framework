import { gen3Api } from '../gen3';
import { GEN3_WORKSPACE_API } from '../../constants';
import {
  PayModel,
  WorkspaceInfo,
  WorkspaceInfoResponse,
  WorkspaceOptions,
  WorkspaceOptionsResponse,
  WorkspacePayModelResponse,
  WorkspaceStatusResponse,
} from './types';

const WorkspaceWithTags = gen3Api.enhanceEndpoints({
  addTagTypes: ['Workspace', 'PayModel'],
});

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
        query: () => `${GEN3_WORKSPACE_API}/status`,
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
