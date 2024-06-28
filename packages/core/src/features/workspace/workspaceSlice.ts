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

export const workspacesApi = gen3Api.injectEndpoints({
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
      setCurrentPayModel: builder.mutation<void, string>({
        query: (id: string) => ({
          url: `${GEN3_WORKSPACE_API}/setpaymodel`,
          method: 'POST',
          body: id,
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
} = workspacesApi;
